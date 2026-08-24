import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const fail = (message) => {
  throw new Error(message);
};

export const classifyRelease = ({
  registryState,
  channelVersion,
  version,
  tagState,
  releaseState,
  assetState,
  metadataState,
}) => {
  if (tagState === "conflict") fail("The release tag targets a different commit.");
  if (tagState === "absent" && releaseState === "present") {
    fail("A GitHub Release exists without its certified tag.");
  }
  if (registryState === "absent") {
    if (tagState !== "absent" || releaseState !== "absent") {
      fail("GitHub release state exists before the npm publication.");
    }
    return "publish";
  }
  if (registryState !== "verified-existing") fail("The npm publication is not verified.");
  if (channelVersion !== version) fail(`npm channel does not point to ${version}.`);
  if (
    tagState === "absent" ||
    releaseState === "absent" ||
    assetState !== "verified" ||
    metadataState !== "verified"
  ) {
    return "repair";
  }
  return "complete";
};

export const releaseMetadataState = (release, version, expectedBody) =>
  release.name === `v${version}` &&
  release.isPrerelease === version.includes("-") &&
  typeof release.body === "string" &&
  release.body.replace(/\r\n/gu, "\n").trimEnd() === expectedBody.trimEnd()
    ? "verified"
    : "conflict";

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.status !== 0) fail(`${command} ${args.join(" ")} failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
};

const npmView = (spec, field) => {
  const result = spawnSync("npm", ["view", spec, field, "--json"], { encoding: "utf8" });
  if (result.status !== 0) fail(`npm view failed: ${result.stderr.trim()}`);
  return JSON.parse(result.stdout.trim() || "null");
};

const resolveTag = (version, sourceSha) => {
  const ref = `refs/tags/v${version}`;
  const row = run("gh", [
    "api",
    `repos/${process.env.GITHUB_REPOSITORY}/git/matching-refs/tags/v${version}`,
    "--jq",
    `.[] | select(.ref == "${ref}") | [.object.type, .object.sha] | @tsv`,
  ]);
  if (!row) return "absent";
  let [type, sha] = row.split("\t");
  while (type === "tag") {
    [type, sha] = run("gh", [
      "api",
      `repos/${process.env.GITHUB_REPOSITORY}/git/tags/${sha}`,
      "--jq",
      "[.object.type, .object.sha] | @tsv",
    ]).split("\t");
  }
  return type === "commit" && sha === sourceSha ? "verified" : "conflict";
};

const inspectRelease = (version, tarball, expectedSha256, expectedBody) => {
  const view = spawnSync(
    "gh",
    [
      "release",
      "view",
      `v${version}`,
      "--repo",
      process.env.GITHUB_REPOSITORY,
      "--json",
      "assets,body,isPrerelease,name",
    ],
    { encoding: "utf8" },
  );
  if (view.status !== 0 && /HTTP 404|release not found/iu.test(view.stderr)) {
    return { releaseState: "absent", assetState: "absent", metadataState: "absent" };
  }
  if (view.status !== 0) fail(`Could not read v${version} Release: ${view.stderr.trim()}`);
  const release = JSON.parse(view.stdout);
  const metadataState = releaseMetadataState(release, version, expectedBody);
  if (!release.assets.some(({ name }) => name === tarball)) {
    return { releaseState: "present", assetState: "absent", metadataState };
  }

  const directory = mkdtempSync(join(tmpdir(), "ginko-docs-release-"));
  try {
    const download = spawnSync(
      "gh",
      [
        "release",
        "download",
        `v${version}`,
        "--repo",
        process.env.GITHUB_REPOSITORY,
        "--pattern",
        tarball,
        "--dir",
        directory,
      ],
      { encoding: "utf8" },
    );
    if (download.status !== 0) {
      fail(`Could not download v${version} asset: ${download.stderr.trim()}`);
    }
    const bytes = readFileSync(join(directory, tarball));
    const actual = createHash("sha256").update(bytes).digest("hex");
    return {
      releaseState: "present",
      assetState: actual === expectedSha256 ? "verified" : "conflict",
      metadataState,
    };
  } finally {
    rmSync(directory, { recursive: true });
  }
};

const main = () => {
  const releaseDir = resolve(process.env.RELEASE_DIR ?? ".release");
  const manifest = JSON.parse(readFileSync(join(releaseDir, "release-artifact.json"), "utf8"));
  const record = JSON.parse(readFileSync(join(releaseDir, "registry-verification.json"), "utf8"));
  if (
    manifest.commit !== process.env.SOURCE_SHA ||
    manifest.packageVersion !== process.env.RELEASE_VERSION
  ) {
    fail("The release plan does not match the certified source.");
  }
  const channel = manifest.packageVersion.includes("-") ? "next" : "latest";
  const tagState = resolveTag(manifest.packageVersion, manifest.commit);
  const expectedBody = readFileSync(join(releaseDir, "release-notes.md"), "utf8");
  const { releaseState, assetState, metadataState } = inspectRelease(
    manifest.packageVersion,
    manifest.tarball,
    manifest.sha256,
    expectedBody,
  );
  const channelVersion =
    record.registryState === "absent"
      ? null
      : npmView(manifest.packageName, `dist-tags.${channel}`);
  const action = classifyRelease({
    registryState: record.registryState,
    channelVersion,
    version: manifest.packageVersion,
    tagState,
    releaseState,
    assetState,
    metadataState,
  });
  const plan = {
    action,
    channel,
    channelVersion,
    tagState,
    releaseState,
    assetState,
    metadataState,
  };
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `action=${action}\n`);
    writeFileSync(join(releaseDir, "release-plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
