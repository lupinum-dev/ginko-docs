import { appendFileSync, readFileSync } from "node:fs";

const action = process.env.ACTION;
const repository = process.env.GITHUB_REPOSITORY;
const runUrl = `${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const ciUrl = `${process.env.GITHUB_SERVER_URL}/${repository}/actions/runs/${process.env.RUN_ID}`;
const plan = JSON.parse(readFileSync(".release/release-plan.json", "utf8"));
const registry = JSON.parse(readFileSync(".release/registry-verification.json", "utf8"));
const nextAction = {
  publish: "Approve the protected `npm` environment after reviewing this exact candidate.",
  repair:
    "No npm publish is needed. Let the GitHub Release repair continue; follow any exact HUMAN-ONLY tag instruction if GitHub rejects the historical tag.",
  complete: "None. npm, tag, GitHub Release, and release asset are already complete.",
}[action];

appendFileSync(
  process.env.GITHUB_STEP_SUMMARY,
  `# Ginko Docs release\n\n` +
    `| Evidence | Value |\n| --- | --- |\n` +
    `| Version | \`${process.env.RELEASE_VERSION}\` |\n` +
    `| npm channel | \`${process.env.CHANNEL}\` |\n` +
    `| Source | [\`${process.env.SOURCE_SHA}\`](${process.env.GITHUB_SERVER_URL}/${repository}/commit/${process.env.SOURCE_SHA}) |\n` +
    `| Certified CI | [run ${process.env.RUN_ID}](${ciUrl}) |\n` +
    `| Reconciliation | [${action}](${runUrl}) |\n` +
    `| npm | ${registry.registryState} |\n` +
    `| Tag | ${plan.tagState} |\n` +
    `| GitHub Release | ${plan.releaseState} |\n` +
    `| Release metadata | ${plan.metadataState} |\n` +
    `| Release asset | ${plan.assetState} |\n` +
    `| Artifact | verified and retained |\n` +
    `| Approval | ${action === "publish" ? "awaiting protected npm approval" : "not required"} |\n\n` +
    `**Next action:** ${nextAction}\n`,
);
