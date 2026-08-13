#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { basename, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, ".package-preview");
const releaseDirectory = resolve(root, "layer/.pack");

function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

const status = git("status", "--porcelain");
if (status) throw new Error(`Package preview requires a clean worktree:\n${status}`);

rmSync(outputDirectory, { force: true, recursive: true });
mkdirSync(outputDirectory);
execFileSync("pnpm", ["release:pack"], { cwd: root, stdio: "inherit" });

const artifact = JSON.parse(
  readFileSync(resolve(releaseDirectory, "release-artifact.json"), "utf8"),
);
if (artifact.commit !== git("rev-parse", "HEAD") || artifact.sourceClean !== true) {
  throw new Error("Preview artifact does not belong to the clean source commit.");
}

const source = resolve(releaseDirectory, artifact.tarball);
const target = resolve(outputDirectory, basename(source));
copyFileSync(source, target);
const sha256 = createHash("sha256").update(readFileSync(target)).digest("hex");
if (sha256 !== artifact.sha256) throw new Error("Preview tarball failed digest verification.");

const output = [
  `directory=${relative(root, outputDirectory)}`,
  `package_name=${artifact.packageName}`,
  `sha256=${sha256}`,
  `tarball=${relative(root, target)}`,
].join("\n");
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`);
console.log(output);

rmSync(releaseDirectory, { force: true, recursive: true });
const finalStatus = git("status", "--porcelain");
if (finalStatus) throw new Error(`Preview build changed tracked files:\n${finalStatus}`);
