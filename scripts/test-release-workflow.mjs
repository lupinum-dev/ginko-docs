import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

const root = resolve(import.meta.dirname, "..");
const publishSource = readFileSync(resolve(root, ".github/workflows/publish.yml"), "utf8");
const ciSource = readFileSync(resolve(root, ".github/workflows/ci.yml"), "utf8");
const recoverySource = readFileSync(resolve(root, "scripts/verify-npm-recovery.mjs"), "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const lockSource = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8");
const sigstoreManifest = JSON.parse(
  readFileSync(resolve(root, "scripts/sigstore-verifier/package.json"), "utf8"),
);
const sigstoreLock = JSON.parse(
  readFileSync(resolve(root, "scripts/sigstore-verifier/package-lock.json"), "utf8"),
);
const publish = parse(publishSource);
const ci = parse(ciSource);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const publishJob = publish.jobs?.publish;
assert(publishJob?.environment === "npm", "Publishing must use the protected npm environment.");
assert(
  publishJob?.permissions?.["id-token"] === "write",
  "Publishing must use npm trusted publishing.",
);

const publishJobSource =
  /^  publish:\n([\s\S]*?)(?=^  [a-z][a-z-]*:\n)/m.exec(publishSource)?.[1] ?? "";
const verifyJobSource =
  /^  verify:\n([\s\S]*?)(?=^  [a-z][a-z-]*:\n)/m.exec(publishSource)?.[1] ?? "";
for (const forbidden of [
  "actions/checkout@",
  "npm install",
  "pnpm install",
  "vp install",
  "node scripts/",
  "sigstore",
  "signedAccessSignatureUrl",
  "dsseEnvelope",
  "fetch(",
]) {
  assert(
    !publishJobSource.includes(forbidden),
    `The privileged job must not contain ${forbidden}.`,
  );
}
for (const required of [
  "registry-verification.json",
  "Object.keys(record).sort()",
  "record.sourceSha !== process.env.SOURCE_SHA",
  "record.tarballSha512 !== sha512",
  "existing !== record.registryShasum",
  "registry existence or bytes changed after verification",
]) {
  assert(
    publishJobSource.includes(required),
    `Protected record enforcement is missing ${required}.`,
  );
}

assert(
  verifyJobSource.includes("scripts/sigstore-verifier/package.json") &&
    verifyJobSource.includes("scripts/sigstore-verifier/package-lock.json") &&
    verifyJobSource.includes('npm ci --prefix "$SIGSTORE_PREFIX"') &&
    verifyJobSource.includes("--ignore-scripts --no-audit --no-fund") &&
    verifyJobSource.includes("node scripts/verify-npm-recovery.mjs"),
  "The unprivileged verifier must install Sigstore from its complete npm lockfile.",
);
for (const forbidden of ["npm install", "npm view sigstore", "--package-lock=false"]) {
  assert(!verifyJobSource.includes(forbidden), `The verifier must not use unlocked ${forbidden}.`);
}
assert(
  packageJson.devDependencies?.sigstore === undefined,
  "The isolated verifier must not narrow the repository's Node support.",
);
assert(!lockSource.includes("sigstore@5.0.0"), "Sigstore must not enter the workspace lockfile.");
assert(
  sigstoreManifest.private === true && sigstoreManifest.dependencies?.sigstore === "5.0.0",
  "The isolated verifier manifest must pin Sigstore 5.0.0.",
);
assert(
  sigstoreLock.lockfileVersion === 3 &&
    sigstoreLock.packages?.[""]?.dependencies?.sigstore === "5.0.0" &&
    sigstoreLock.packages?.["node_modules/sigstore"]?.version === "5.0.0",
  "The isolated verifier lockfile must pin Sigstore 5.0.0.",
);
for (const [path, dependency] of Object.entries(sigstoreLock.packages ?? {})) {
  if (!path) continue;
  assert(
    typeof dependency.resolved === "string" &&
      dependency.resolved.startsWith("https://registry.npmjs.org/") &&
      dependency.integrity?.startsWith("sha512-"),
    `The isolated verifier dependency ${path} must have registry and integrity pins.`,
  );
}
for (const required of [
  'version !== "5.0.0"',
  "verifyBundle ?? loadSigstoreVerifier()",
  "certificateIdentityURI",
  '"1.3.6.1.4.1.57264.1.3": sourceSha',
  "subjects[0]?.digest?.sha512 !== tarballSha512",
]) {
  assert(recoverySource.includes(required), `Cryptographic recovery is missing ${required}.`);
}

const verifiedUpload = publish.jobs?.verify?.steps?.find(
  (step) => step.with?.name === "verified-ginko-docs-release",
);
assert(
  publish.on?.workflow_run?.workflows?.includes("CI") &&
    publish.on?.workflow_run?.types?.includes("completed"),
  "Publishing must reconcile after the repository CI workflow completes.",
);
assert(
  publish.on?.workflow_dispatch === undefined,
  "Release reconciliation must begin only from the exact successful CI event.",
);
assert(
  verifyJobSource.includes("context.payload.workflow_run.head_sha") &&
    verifyJobSource.includes("Number(process.env.RUN_ATTEMPT) > 1") &&
    verifyJobSource.includes("context.payload.workflow_run.id") &&
    verifyJobSource.includes("steps.source.outputs.source-sha"),
  "Candidate selection must be exact and reject ambiguous manual reconciliation.",
);
assert(
  publish.jobs?.publish?.if === "needs.verify.outputs.action == 'publish'",
  "A complete or repair-only release must not enter the npm environment.",
);
assert(
  publishSource.includes("HUMAN-ONLY: GitHub could not create historical tag") &&
    publishSource.includes("rerun only this failed GitHub release job"),
  "Historical tag failures must provide the exact safe maintainer action.",
);
assert(
  verifiedUpload?.with?.["retention-days"] === 14,
  "The verified candidate must be retained for 14 days.",
);

const candidateUpload = ci.jobs?.validate?.steps?.find(
  (step) => step.with?.name === "ginko-docs-release",
);
assert(
  candidateUpload?.with?.["retention-days"] === 14,
  "The CI candidate must be retained for 14 days.",
);

process.stdout.write("Release workflow policy verified.\n");
