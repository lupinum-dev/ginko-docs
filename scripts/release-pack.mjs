import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const output = resolve(root, "layer/.pack");
const sourceManifest = JSON.parse(readFileSync(resolve(root, "layer/package.json"), "utf8"));

function run(command, args, cwd = root, stdio = "inherit") {
  return execFileSync(command, args, {
    cwd,
    encoding: stdio === "pipe" ? "utf8" : undefined,
    stdio,
  });
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function packOnce(parent, index) {
  const directory = resolve(parent, `pack-${index}`);
  mkdirSync(directory);
  run("vp", ["pm", "pack", "--filter", "@lupinum/ginko-docs", "--pack-destination", directory]);
  const archives = readdirSync(directory).filter((file) => file.endsWith(".tgz"));
  if (archives.length !== 1) {
    throw new Error(`Expected one package archive, found ${archives.length}.`);
  }
  const path = resolve(directory, archives[0]);
  return { filename: archives[0], path, hash: sha256(path) };
}

function inspectPackage(path, temporaryRoot) {
  const extract = resolve(temporaryRoot, "extract");
  mkdirSync(extract);
  run("tar", ["-xzf", path, "-C", extract], root, "pipe");
  const manifestPath = resolve(extract, "package/package.json");
  if (!existsSync(manifestPath)) throw new Error("Packed layer is missing package.json.");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.name !== sourceManifest.name || manifest.version !== sourceManifest.version) {
    throw new Error("Packed layer identity does not match its source manifest.");
  }
  if (
    manifest.peerDependencies?.["@lupinum/ginko-content"] !==
    sourceManifest.peerDependencies["@lupinum/ginko-content"]
  ) {
    throw new Error("Packed layer does not declare the supported Ginko Content peer range.");
  }
  if (manifest.engines?.node !== sourceManifest.engines.node) {
    throw new Error("Packed layer does not preserve the supported Node.js range.");
  }
  for (const field of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const [name, range] of Object.entries(manifest[field] || {})) {
      if (typeof range === "string" && /^(?:file:|workspace:|\/|[A-Za-z]:[\\/])/.test(range)) {
        throw new Error(
          `Packed manifest contains a non-portable dependency: ${field}.${name}=${range}`,
        );
      }
    }
  }
  const entries = run("tar", ["-tzf", path], root, "pipe").split("\n").filter(Boolean);
  const forbidden = entries.filter(
    (entry) =>
      /(?:^|\/)(?:\.env(?:\.|$)|node_modules|\.nuxt|\.output|\.pack|__snapshots__)(?:\/|$)/.test(
        entry,
      ) || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry),
  );
  if (forbidden.length)
    throw new Error(`Packed layer contains forbidden files:\n${forbidden.join("\n")}`);
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const temporaryRoot = mkdtempSync(resolve(tmpdir(), "ginko-docs-release-"));
try {
  const first = packOnce(temporaryRoot, 1);
  const second = packOnce(temporaryRoot, 2);
  if (first.filename !== second.filename || first.hash !== second.hash) {
    throw new Error("Ginko Docs package archives are not byte reproducible.");
  }
  inspectPackage(first.path, temporaryRoot);
  const archive = resolve(output, first.filename);
  copyFileSync(first.path, archive);
  const commit = run("git", ["rev-parse", "HEAD"], root, "pipe").trim();
  const dirty = run("git", ["status", "--porcelain"], root, "pipe").trim().length > 0;
  writeFileSync(
    resolve(output, "release-artifact.json"),
    `${JSON.stringify(
      {
        packageName: sourceManifest.name,
        packageVersion: sourceManifest.version,
        commit,
        sourceClean: !dirty,
        sha256: first.hash,
        tarball: first.filename,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Prepared ${first.filename} (${first.hash}).`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
