#!/usr/bin/env node
// Evidence for every one-shell brief: screenshots at 375 and 1440 px in light
// and dark, an axe run per route, width and scheme, and console errors.
//
//   node plans/one-shell/tools/shots.mjs --base http://localhost:3120 --out .evidence/03a/after
//   node plans/one-shell/tools/shots.mjs --base ... --out ... --routes /docs,/de/dokumentation
//   node plans/one-shell/tools/shots.mjs --base ... --out ... --full   (full-page screenshots)
//
// Serve a production build on a free port first (never 3000-3011):
//   pnpm docs:build && PORT=3120 node docs/.output/server/index.mjs
//
// Writes <out>/<route>--<width>-<scheme>.png and <out>/report.json.
// Exits 1 when a page errors, a console error appears, or axe reports a
// serious or critical violation.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";

const DEFAULT_ROUTES = [
  "/docs/getting-started",
  "/docs/components/component-showcase",
  "/docs/components/editorial-layouts",
  "/de/dokumentation/erste-schritte",
];

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const base = option("base", "http://localhost:3120").replace(/\/$/, "");
const out = resolve(option("out", ".evidence/shots"));
const routes = (option("routes", "") || DEFAULT_ROUTES.join(",")).split(",").filter(Boolean);
const fullPage = args.includes("--full");
const widths = [375, 1440];
const schemes = ["light", "dark"];

// axe-core arrives transitively (no direct dependency), so look in the
// workspace's pnpm store relative to this file, not the working directory.
function findAxe() {
  const store = resolve(import.meta.dirname, "../../../node_modules/.pnpm");
  if (!existsSync(store)) return null;
  const entry = readdirSync(store).find((name) => name.startsWith("axe-core@"));
  const file = entry && join(store, entry, "node_modules/axe-core/axe.min.js");
  return file && existsSync(file) ? readFileSync(file, "utf8") : null;
}

function executablePath() {
  const candidates = [
    process.env.CHROMIUM_PATH,
    chromium.executablePath(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      readFileSync(candidate);
      return candidate;
    } catch {}
  }
  throw new Error("No Chromium found. Set CHROMIUM_PATH or run `pnpm exec playwright-core install chromium`.");
}

mkdirSync(out, { recursive: true });
const axeSource = findAxe();
if (!axeSource) {
  // Silent skipping would make passing evidence meaningless.
  console.error("axe-core not found in the workspace pnpm store; run pnpm install.");
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: executablePath(), headless: true });
const report = [];
let failed = false;

async function capture(context, route, width, scheme, errors) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" || /hydration/i.test(message.text())) {
      errors.push(`console ${message.type()}: ${message.text()}`);
    }
  });

  const response = await page.goto(`${base}${route}`, { waitUntil: "load" });
  await page.waitForTimeout(400);
  const status = response?.status() ?? 0;
  const name = `${route.replace(/^\//, "").replace(/\//g, "_") || "home"}--${width}-${scheme}.png`;
  await page.screenshot({ path: join(out, name), fullPage, animations: "disabled" });

  // Run axe in both schemes: dark-mode contrast fails independently.
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, { resultTypes: ["violations"] }),
  );
  const violations = result.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.slice(0, 5).map((node) => node.target.join(" ")),
    }));
  return { status, screenshot: name, violations };
}

for (const route of routes) {
  for (const width of widths) {
    for (const scheme of schemes) {
      const context = await browser.newContext({
        viewport: { width, height: width < 768 ? 812 : 900 },
        colorScheme: scheme,
        deviceScaleFactor: 1,
      });
      const errors = [];
      let entry;
      try {
        entry = { route, width, scheme, ...(await capture(context, route, width, scheme, errors)), errors };
      } catch (error) {
        // Record the failed step and keep going, so report.json is always written.
        entry = { route, width, scheme, status: 0, errors: [...errors, `run: ${error.message}`], violations: [] };
      } finally {
        await context.close();
      }
      if (entry.status === 0 || entry.status >= 400 || entry.errors.length > 0 || entry.violations.length > 0)
        failed = true;
      report.push(entry);
      console.log(
        `${entry.status} ${route} ${width}px ${scheme}: ${entry.errors.length} errors, ${entry.violations.length} serious/critical axe`,
      );
    }
  }
}

await browser.close();
writeFileSync(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote report.json for ${report.length} runs to ${out}`);
process.exit(failed ? 1 : 0);
