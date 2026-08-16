import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(readFileSync(resolve(root, "docs/vercel.json"), "utf8"));
const expectedIgnoreCommand =
  'if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then exit 1; fi; git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- . ../layer ../package.json ../pnpm-lock.yaml ../pnpm-workspace.yaml ../tsconfig.json ../vite.config.ts';
const packageManifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const workspacePolicy = readFileSync(resolve(root, "pnpm-workspace.yaml"), "utf8");
const ciWorkflow = readFileSync(resolve(root, ".github/workflows/ci.yml"), "utf8");
const renovate = JSON.parse(readFileSync(resolve(root, "renovate.json"), "utf8"));
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(!existsSync(resolve(root, "vercel.json")), "Keep vercel.json in the deployable docs app.");
check(
  /^pnpm@(?:1[1-9]|[2-9]\d)\./u.test(packageManifest.packageManager ?? ""),
  "Use pnpm 11 or newer for strict dependency quarantine.",
);
check(config.framework === "nuxtjs", "Select the Nuxt framework explicitly.");
check(
  config.git?.deploymentEnabled === true,
  "Create a Vercel status for every pull-request commit.",
);
check(
  config.ignoreCommand === expectedIgnoreCommand,
  "Skip deployments that cannot affect the documentation app.",
);
check(config.outputDirectory === null, "Let Nuxt and Vercel detect .vercel/output.");
check(config.buildCommand === "pnpm --dir .. docs:build", "Build from the locked root workspace.");
check(!("installCommand" in config), "Let Vercel detect pnpm from the repository lockfile.");
check(
  ciWorkflow.includes("node scripts/verify-action-shas.mjs"),
  "CI must verify pinned Action commits upstream.",
);
check(!ciWorkflow.includes("GITHUB_TOKEN"), "Action verification must not receive GITHUB_TOKEN.");
check(renovate.minimumReleaseAge === "1 day", "Renovate must match the 24-hour pnpm quarantine.");
for (const requiredPolicy of [
  "minimumReleaseAge: 1440",
  "minimumReleaseAgeStrict: true",
  "minimumReleaseAgeIgnoreMissingTime: false",
]) {
  check(workspacePolicy.includes(requiredPolicy), `Missing dependency policy: ${requiredPolicy}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Vercel app-root contract: ok");
