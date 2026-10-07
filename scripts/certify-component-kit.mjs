import { chromium } from "playwright-core";
import { gzipSync } from "node:zlib";
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { checkDependencyPolicy } from "./check-dependency-policy.mjs";
import { verifyPackageAgentDocs } from "./package-agent-docs.mjs";

const root = resolve(import.meta.dirname, "..");
const workspaceManifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const docsManifest = JSON.parse(readFileSync(resolve(root, "docs/package.json"), "utf8"));
const layerManifest = JSON.parse(readFileSync(resolve(root, "layer/package.json"), "utf8"));
const contentVersion =
  layerManifest.peerDependencies["@lupinum/ginko-content"].match(/>=([^ ]+)/)?.[1];
const rolldownVersion = workspaceManifest.devDependencies.rolldown;
if (!contentVersion || !/^\d+\.\d+\.\d+$/.test(rolldownVersion)) {
  throw new Error(
    "Certification requires a minimum Content peer and exact reviewed Rolldown version.",
  );
}
const contentArchive = process.env.GINKO_CONTENT_TARBALL
  ? resolve(process.env.GINKO_CONTENT_TARBALL)
  : null;
if (contentArchive && !existsSync(contentArchive))
  throw new Error(`Configured Content tarball does not exist: ${contentArchive}`);
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
let browser;
try {
  write(
    resolve(fixture, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      packageManager: workspaceManifest.packageManager,
      dependencies: {
        "@lupinum/ginko-content": contentArchive ? `file:${contentArchive}` : contentVersion,
        "@lupinum/ginko-docs": `file:${archive[0]}`,
        nuxt: docsManifest.dependencies.nuxt,
        vue: docsManifest.dependencies.vue,
      },
    }),
  );
  const workspacePolicy = [
    "minimumReleaseAge: 1440",
    "minimumReleaseAgeStrict: true",
    "minimumReleaseAgeIgnoreMissingTime: false",
    "overrides:",
    `  rolldown: ${rolldownVersion}`,
    "allowBuilds:",
    "  esbuild: true",
    "  vue-demi: true",
    "",
  ].join("\n");
  const policyFailures = checkDependencyPolicy(workspacePolicy);
  if (policyFailures.length) throw new Error(policyFailures.join("\n"));
  write(resolve(fixture, "pnpm-workspace.yaml"), workspacePolicy);
  write(
    resolve(fixture, "nuxt.config.ts"),
    'export default defineNuxtConfig({ modules: ["@lupinum/ginko-docs/component-kit"] })\n',
  );
  write(
    resolve(fixture, "app/components/Icon.vue"),
    '<script setup lang="ts">defineProps<{ name: string }>()</script><template><svg data-host-icon viewBox="0 0 24 24" aria-hidden="true"><title>{{ name }}</title><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" /></svg></template>\n',
  );
  write(
    resolve(fixture, "app/components/LearningObjective.vue"),
    '<script setup lang="ts">defineProps<{ title: string; assessed?: boolean }>()</script><template><section data-learning-objective><h2>{{ title }}</h2><slot /><aside><slot name="tip" /></aside></section></template>\n',
  );
  write(
    resolve(fixture, "app/pages/index.vue"),
    '<script setup lang="ts">import { ginkoDocsAuthoringKitSource } from "@lupinum/ginko-docs/authoring"; const authoringTags = Object.keys(ginkoDocsAuthoringKitSource.authoring).sort().join(",")</script><template><main :data-authoring-tags="authoringTags"><MdcInfo title="Context">Real Docs info</MdcInfo><MdcNote title="Note title">Note body</MdcNote><MdcWarning title="Warning title">Warning body</MdcWarning><MdcError title="Error title">Error body</MdcError><MdcSuccess title="Success title">Success body</MdcSuccess><MdcIdea title="Idea title">Idea body</MdcIdea><MdcAside label="Aside title">Aside body</MdcAside><MdcExcerpt label="Excerpt title" source="Source name">Excerpt body</MdcExcerpt><MdcLayout type="border"><MdcColumn size="sm">First</MdcColumn><MdcColumn size="lg">Second</MdcColumn></MdcLayout><MdcFlow><p>Standalone reading flow</p><MdcFigure src="/figure.svg" alt="A green canopy" caption="A figure without the Docs shell" /></MdcFlow><LearningObjective title="Host renderer" assessed>Main<template #tip>Named tip</template></LearningObjective></main></template>\n',
  );
  write(
    resolve(fixture, "public/figure.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="960" height="640" fill="#306e44" /></svg>',
  );
  run("pnpm", ["install", "--ignore-scripts"], fixture);
  const entry = createRequire(resolve(fixture, "package.json")).resolve(
    "@lupinum/ginko-docs/agent-docs",
  );
  await verifyPackageAgentDocs(resolve(dirname(entry), "../.."));
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
  const assets = readdirSync(publicAssets).filter((name) => /\.(?:css|js)$/.test(name));
  const sizes = assets.map((name) => {
    const bytes = readFileSync(resolve(publicAssets, name));
    return { name, bytes: bytes.length, gzip: gzipSync(bytes).length };
  });
  console.log(
    JSON.stringify({
      componentKitClientAssets: sizes,
      totalBytes: sizes.reduce((sum, item) => sum + item.bytes, 0),
      totalGzipBytes: sizes.reduce((sum, item) => sum + item.gzip, 0),
    }),
  );
  if (
    css.includes("Public Sans") ||
    css.includes("@font-face") ||
    readdirSync(publicAssets).some((name) => /\.(?:woff2?|ttf|otf)$/.test(name))
  )
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
  if (/<(?:header|nav)\b/.test(html) || /docs-sidebar|docs-toc-shell/.test(css))
    throw new Error("The component-only module installed the Docs shell.");
  for (const text of [
    'data-authoring-tags="aside,column,error,excerpt,figure,flow,idea,info,layout,note,success,warning"',
    'class="content-flow',
    "Real Docs info",
    "Standalone reading flow",
    "A figure without the Docs shell",
    // English fallback from useDocsText: the fixture has no @nuxtjs/i18n.
    'aria-label="Zoom image: A green canopy"',
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
  browser = await chromium.launch({
    executablePath: [
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      chromium.executablePath(),
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
    ].find((path) => path && existsSync(path)),
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`http://127.0.0.1:${port}/`);
    const figure = page.locator("figure.content-media");
    const image = figure.getByRole("img", { name: "A green canopy" });
    await image.waitFor({ state: "visible" });
    await page.screenshot({
      path: resolve(root, "layer/.pack", `component-kit-${width}.png`),
      fullPage: true,
    });
    const [frame, media] = await Promise.all([figure.boundingBox(), image.boundingBox()]);
    if (
      !frame ||
      !media ||
      media.x < frame.x - 1 ||
      media.x + media.width > frame.x + frame.width + 1
    )
      throw new Error("Standalone figure escapes its frame.");
    const trigger = page.getByRole("button", { name: "Zoom image: A green canopy" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "A figure without the Docs shell" });
    await dialog.waitFor({ state: "visible" });
    if ((await dialog.evaluate((node) => getComputedStyle(node).position)) !== "fixed")
      throw new Error("Standalone image zoom is missing its overlay styles.");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    if (!(await trigger.evaluate((node) => node === document.activeElement)))
      throw new Error("Image zoom does not restore keyboard focus.");
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1))
      throw new Error(
        `Component-only fixture overflows the viewport: ${JSON.stringify(await page.locator("body *").evaluateAll((nodes) => nodes.filter((node) => node.getBoundingClientRect().right > window.innerWidth + 1).map((node) => ({ tag: node.tagName, class: node.className, right: node.getBoundingClientRect().right }))))}`,
      );
    await page.screenshot({
      path: resolve(root, "layer/.pack", `component-kit-${width}.png`),
      fullPage: true,
    });
  }
  if (errors.length) throw new Error(`Component-only browser errors: ${errors.join("; ")}`);
} finally {
  await browser?.close();
  server?.kill("SIGTERM");
  rmSync(fixture, { recursive: true, force: true });
}

console.log("Verified the packed component-only kit and host-owned renderer.");
