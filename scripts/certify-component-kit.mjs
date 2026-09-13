import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const root = resolve(import.meta.dirname, "..");
const archive = readdirSync(resolve(root, "layer/.pack"))
  .filter((name) => name.endsWith(".tgz"))
  .map((name) => resolve(root, "layer/.pack", name));
if (archive.length !== 1) throw new Error(`Expected one Docs archive, found ${archive.length}.`);

function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed.\n${result.stdout}\n${result.stderr}`);
  }
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not allocate a port.");
  await new Promise((resolvePromise) => server.close(resolvePromise));
  return address.port;
}

const fixture = mkdtempSync(resolve(tmpdir(), "ginko-docs-component-kit-"));
let server;
try {
  write(
    resolve(fixture, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      packageManager: "pnpm@11.21.0",
      dependencies: {
        "@lupinum/ginko-content": "1.0.0-beta.7",
        "@lupinum/ginko-docs": `file:${archive[0]}`,
        nuxt: "4.5.2",
        vue: "3.5.42",
      },
    }),
  );
  write(
    resolve(fixture, "nuxt.config.ts"),
    'export default defineNuxtConfig({ modules: ["@lupinum/ginko-docs/component-kit"] })\n',
  );
  write(
    resolve(fixture, "app/components/Icon.vue"),
    '<script setup lang="ts">defineProps<{ name: string }>()</script><template><span data-host-icon>{{ name }}</span></template>\n',
  );
  write(
    resolve(fixture, "app/components/LearningObjective.vue"),
    '<script setup lang="ts">defineProps<{ title: string; assessed?: boolean }>()</script><template><section data-learning-objective><h2>{{ title }}</h2><slot /><aside><slot name="tip" /></aside></section></template>\n',
  );
  write(
    resolve(fixture, "app/pages/index.vue"),
    '<script setup lang="ts">import { ginkoDocsAuthoringKitSource } from "@lupinum/ginko-docs/authoring"; const authoringTags = Object.keys(ginkoDocsAuthoringKitSource.authoring).sort().join(",")</script><template><main :data-authoring-tags="authoringTags"><MdcInfo title="Context">Real Docs info</MdcInfo><MdcNote title="Note title">Note body</MdcNote><MdcWarning title="Warning title">Warning body</MdcWarning><MdcError title="Error title">Error body</MdcError><MdcSuccess title="Success title">Success body</MdcSuccess><MdcIdea title="Idea title">Idea body</MdcIdea><MdcAside label="Aside title">Aside body</MdcAside><MdcExcerpt label="Excerpt title" source="Source name">Excerpt body</MdcExcerpt><MdcLayout type="border"><MdcColumn size="sm">First</MdcColumn><MdcColumn size="lg">Second</MdcColumn></MdcLayout><LearningObjective title="Host renderer" assessed>Main<template #tip>Named tip</template></LearningObjective></main></template>\n',
  );
  run("pnpm", ["install", "--ignore-scripts"], fixture);
  run("pnpm", ["exec", "nuxt", "build"], fixture);

  const publicAssets = resolve(fixture, ".output/public/_nuxt");
  const css = readdirSync(publicAssets)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(resolve(publicAssets, name), "utf8"))
    .join("\n");
  if (
    !css.includes(".content-layout-row") ||
    !css.includes(".content-callout") ||
    !css.includes(".content-aside") ||
    !css.includes(".content-excerpt")
  ) {
    throw new Error("The component-only production build dropped its styles.");
  }
  if (css.includes("Public Sans"))
    throw new Error("The component-only module installed host fonts.");

  const port = await availablePort();
  server = spawn(process.execPath, [resolve(fixture, ".output/server/index.mjs")], {
    cwd: fixture,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: "ignore",
  });
  let home;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      home = await fetch(`http://127.0.0.1:${port}/`);
      break;
    } catch {
      await delay(100);
    }
  }
  if (!home?.ok) throw new Error("The component-only fixture did not start.");
  const html = await home.text();
  for (const text of [
    'data-authoring-tags="aside,column,error,excerpt,idea,info,layout,note,success,warning"',
    "Real Docs info",
    "First",
    "Second",
    "Host renderer",
    "Named tip",
    "Note title",
    "Warning title",
    "Error title",
    "Success title",
    "Idea title",
    "Aside title",
    "Excerpt title",
    "Source name",
    'class="content-excerpt',
    'class="content-aside',
  ]) {
    if (!html.includes(text)) throw new Error(`Rendered fixture is missing "${text}".`);
  }
  const unintendedRoute = await fetch(`http://127.0.0.1:${port}/docs`);
  if (unintendedRoute.status !== 404)
    throw new Error("The component-only module installed a Docs route.");
} finally {
  server?.kill("SIGTERM");
  rmSync(fixture, { recursive: true, force: true });
}

console.log("Verified the packed component-only kit and host-owned renderer.");
