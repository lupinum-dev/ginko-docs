import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { parse } from "yaml";

const root = resolve(import.meta.dirname, "..");
const workflow = parse(readFileSync(resolve(root, ".github/workflows/publish.yml"), "utf8"));

const stepProgram = (jobName, stepName) => {
  const program = workflow.jobs?.[jobName]?.steps?.find((step) => step.name === stepName)?.run;
  assert.equal(typeof program, "string", `Missing ${jobName} step ${stepName}.`);
  return program;
};

const protectedRun = stepProgram("publish", "Publish or verify the certified tarball").trim();
const protectedMatch = /^node --input-type=module <<'NODE'\n([\s\S]+)\nNODE$/u.exec(protectedRun);
assert(protectedMatch, "The protected release program must remain extractable for fixtures.");
const protectedProgram = protectedMatch[1];
const fastProtectedProgram = protectedProgram
  .replace("attempt < 240", "attempt < 1")
  .replace(
    "Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000)",
    "Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 0)",
  );
assert.notEqual(fastProtectedProgram, protectedProgram, "The polling fixture must run once.");

const sourceSha = "a".repeat(40);
const releaseVersion = "1.2.3";
const packageName = "@lupinum/ginko-docs";
const tarball = "lupinum-ginko-docs-1.2.3.tgz";
const tarballBytes = Buffer.from("certified ginko docs tarball");
const tarballSha1 = createHash("sha1").update(tarballBytes).digest("hex");
const tarballSha512 = createHash("sha512").update(tarballBytes).digest("hex");

const fakeNpmSource = `#!/usr/bin/env node
const { readFileSync } = require("node:fs");
const fixture = JSON.parse(readFileSync(process.env.NPM_FIXTURE, "utf8"));
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--version") {
  process.stdout.write("11.18.0\\n");
  process.exit(0);
}
if (args[0] === "view") {
  const key = args[1] + " " + args[2];
  if (!Object.hasOwn(fixture.views, key)) {
    process.stderr.write("Unexpected npm view: " + key + "\\n");
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(fixture.views[key]));
  process.exit(0);
}
process.stderr.write("Unexpected npm command: " + args.join(" ") + "\\n");
process.exit(2);
`;

const runProtected = ({ attestations, recordChange }) => {
  const directory = mkdtempSync(join(tmpdir(), "ginko-docs-protected-release-"));
  try {
    const releaseDir = join(directory, ".release");
    const binDir = join(directory, "bin");
    mkdirSync(releaseDir);
    mkdirSync(binDir);

    const manifest = {
      packageName,
      packageVersion: releaseVersion,
      commit: sourceSha,
      tarball,
    };
    const record = {
      schemaVersion: 1,
      packageName,
      packageVersion: releaseVersion,
      sourceSha,
      tarball,
      tarballSha1,
      tarballSha512,
      registryState: "verified-existing",
      registryShasum: tarballSha1,
      provenanceBundleSha256: "b".repeat(64),
    };
    recordChange?.(record);
    writeFileSync(join(releaseDir, "release-artifact.json"), JSON.stringify(manifest));
    writeFileSync(join(releaseDir, "registry-verification.json"), JSON.stringify(record));
    writeFileSync(join(releaseDir, tarball), tarballBytes);

    const spec = `${packageName}@${releaseVersion}`;
    const npmFixture = join(directory, "npm-fixture.json");
    writeFileSync(
      npmFixture,
      JSON.stringify({
        views: {
          [`${spec} version`]: releaseVersion,
          [`${spec} dist.shasum`]: tarballSha1,
          [`${spec} dist.attestations`]: attestations,
          [`${packageName} dist-tags.latest`]: releaseVersion,
        },
      }),
    );
    const fakeNpm = join(binDir, "npm");
    writeFileSync(fakeNpm, fakeNpmSource);
    chmodSync(fakeNpm, 0o755);

    return spawnSync(process.execPath, ["--input-type=module", "--eval", fastProtectedProgram], {
      cwd: directory,
      encoding: "utf8",
      env: {
        ...process.env,
        SOURCE_SHA: sourceSha,
        NPM_FIXTURE: npmFixture,
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        RELEASE_VERSION: releaseVersion,
      },
    });
  } finally {
    rmSync(directory, { recursive: true });
  }
};

const provenance = {
  url: `https://registry.npmjs.org/-/npm/v1/attestations/${packageName}@${releaseVersion}`,
  provenance: { predicateType: "https://slsa.dev/provenance/v1" },
};
const completeRegistry = runProtected({ attestations: provenance });
assert.equal(completeRegistry.status, 0, completeRegistry.stderr);

for (const incomplete of [{}, { url: provenance.url }, { provenance: provenance.provenance }]) {
  const incompleteRegistry = runProtected({ attestations: incomplete });
  assert.notEqual(incompleteRegistry.status, 0, "Incomplete provenance metadata must fail.");
  assert.match(incompleteRegistry.stderr, /did not expose the required bytes, provenance/u);
}

const unverifiedRecord = runProtected({
  attestations: provenance,
  recordChange: (record) => {
    record.provenanceBundleSha256 = null;
  },
});
assert.notEqual(
  unverifiedRecord.status,
  0,
  "Existing bytes require a provenance verification hash.",
);
assert.match(unverifiedRecord.stderr, /Registry verification record does not match/u);

const githubReleaseProgram = stepProgram(
  "github-release",
  "Create release from the published artifact",
);
const fakeGhSource = `#!/usr/bin/env node
const { appendFileSync, readFileSync } = require("node:fs");
const fixture = JSON.parse(readFileSync(process.env.GH_FIXTURE, "utf8"));
const args = process.argv.slice(2);
appendFileSync(process.env.GH_LOG, JSON.stringify(args) + "\\n");
if (args[0] === "api") {
  const endpoint = args[1] || "";
  if (endpoint.includes("/git/matching-refs/tags/")) {
    if (fixture.tag) process.stdout.write(fixture.tag.type + "\\t" + fixture.tag.sha + "\\n");
    process.exit(0);
  }
  const tagObject = endpoint.match(/\\/git\\/tags\\/([0-9a-f]+)$/);
  if (tagObject && fixture.peeled[tagObject[1]]) {
    const target = fixture.peeled[tagObject[1]];
    process.stdout.write(target.type + "\\t" + target.sha + "\\n");
    process.exit(0);
  }
  process.stderr.write("Unexpected gh api endpoint: " + endpoint + "\\n");
  process.exit(2);
}
if (args[0] === "release" && args[1] === "view") {
  process.exit(fixture.releaseExists ? 0 : 1);
}
if (args[0] === "release" && ["upload", "edit", "create"].includes(args[1])) process.exit(0);
process.stderr.write("Unexpected gh command: " + args.join(" ") + "\\n");
process.exit(2);
`;

const runGithubRelease = ({ version, tag, peeled = {}, releaseExists }) => {
  const directory = mkdtempSync(join(tmpdir(), "ginko-docs-github-release-"));
  try {
    const releaseDir = join(directory, ".release");
    const binDir = join(directory, "bin");
    mkdirSync(releaseDir);
    mkdirSync(binDir);
    writeFileSync(join(releaseDir, "release-artifact.json"), JSON.stringify({ tarball }));
    writeFileSync(join(releaseDir, "release-notes.md"), "Release notes\n");
    writeFileSync(join(releaseDir, tarball), tarballBytes);

    const ghFixture = join(directory, "gh-fixture.json");
    const ghLog = join(directory, "gh.log");
    writeFileSync(ghFixture, JSON.stringify({ tag, peeled, releaseExists }));
    writeFileSync(ghLog, "");
    const fakeGh = join(binDir, "gh");
    writeFileSync(fakeGh, fakeGhSource);
    chmodSync(fakeGh, 0o755);

    const result = spawnSync("bash", ["-e", "-o", "pipefail", "-c", githubReleaseProgram], {
      cwd: directory,
      encoding: "utf8",
      env: {
        ...process.env,
        GH_FIXTURE: ghFixture,
        GH_LOG: ghLog,
        GH_TOKEN: "fixture",
        GITHUB_REPOSITORY: "lupinum-dev/ginko-docs",
        SOURCE_SHA: sourceSha,
        PATH: `${binDir}${delimiter}${process.env.PATH ?? ""}`,
        RELEASE_VERSION: version,
      },
    });
    const calls = readFileSync(ghLog, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return { calls, result };
  } finally {
    rmSync(directory, { recursive: true });
  }
};

const stableRepair = runGithubRelease({
  version: releaseVersion,
  tag: { type: "commit", sha: sourceSha },
  releaseExists: true,
});
assert.equal(stableRepair.result.status, 0, stableRepair.result.stderr);
const stableEdit = stableRepair.calls.find((args) => args[0] === "release" && args[1] === "edit");
assert(stableEdit?.includes("--prerelease=false"), "Stable repair must clear prerelease state.");
assert(
  stableRepair.calls.findIndex((args) => args[0] === "api") <
    stableRepair.calls.findIndex((args) => args[0] === "release" && args[1] === "view"),
  "The tag must be re-read before release repair.",
);

const annotatedTagSha = "b".repeat(40);
const prereleaseRepair = runGithubRelease({
  version: "1.2.3-beta.1",
  tag: { type: "tag", sha: annotatedTagSha },
  peeled: { [annotatedTagSha]: { type: "commit", sha: sourceSha } },
  releaseExists: true,
});
assert.equal(prereleaseRepair.result.status, 0, prereleaseRepair.result.stderr);
assert(
  prereleaseRepair.calls.some(
    (args) => args[0] === "api" && args[1].endsWith(`/git/tags/${annotatedTagSha}`),
  ),
  "Annotated tags must be peeled to their commit.",
);
const prereleaseEdit = prereleaseRepair.calls.find(
  (args) => args[0] === "release" && args[1] === "edit",
);
assert(prereleaseEdit?.includes("--prerelease"), "Prerelease repair must set prerelease state.");
assert(!prereleaseEdit?.includes("--prerelease=false"));

const conflictingTag = runGithubRelease({
  version: releaseVersion,
  tag: { type: "commit", sha: "c".repeat(40) },
  releaseExists: false,
});
assert.notEqual(conflictingTag.result.status, 0, "A conflicting tag must stop release creation.");
assert(
  !conflictingTag.calls.some(
    (args) => args[0] === "release" && ["create", "edit", "upload"].includes(args[1]),
  ),
  "A conflicting tag must never be moved or reused.",
);

const freshRelease = runGithubRelease({
  version: releaseVersion,
  tag: null,
  releaseExists: false,
});
assert.equal(freshRelease.result.status, 0, freshRelease.result.stderr);
const createCall = freshRelease.calls.find((args) => args[0] === "release" && args[1] === "create");
assert(createCall, "A missing tag and Release must use create.");
assert.equal(createCall[createCall.indexOf("--target") + 1], sourceSha);
assert(!createCall.includes("--prerelease"));

const orphanedRelease = runGithubRelease({
  version: releaseVersion,
  tag: null,
  releaseExists: true,
});
assert.notEqual(orphanedRelease.result.status, 0, "Release repair requires its existing tag.");
assert(
  !orphanedRelease.calls.some(
    (args) => args[0] === "release" && ["edit", "upload"].includes(args[1]),
  ),
);

process.stdout.write("Protected release recovery fixtures passed.\n");
