import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsApp = resolve(root, "docs");
const layerManifest = JSON.parse(readFileSync(resolve(root, "layer/package.json"), "utf8"));
const contentVersion =
  layerManifest.peerDependencies["@lupinum/ginko-content"].match(/>=([^ ]+)/)?.[1];
if (!contentVersion) throw new Error("Could not derive the minimum Ginko Content peer version.");
const contentArchive = process.env.GINKO_CONTENT_TARBALL
  ? resolve(process.env.GINKO_CONTENT_TARBALL)
  : null;
if (contentArchive && !existsSync(contentArchive)) {
  throw new Error(`Configured Ginko Content tarball does not exist: ${contentArchive}`);
}
const archive = readdirSync(resolve(root, "layer/.pack"))
  .filter((entry) => entry.endsWith(".tgz"))
  .map((entry) => resolve(root, "layer/.pack", entry));

if (archive.length !== 1) throw new Error(`Expected one release archive, found ${archive.length}.`);
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

const variants = [
  {
    name: "single-tabs",
    switcher: "tabs",
    singleLocale: true,
    usesLayerLocaleDefault: true,
    blog: false,
    nuxtVersion: "4.5.1",
  },
  { name: "i18n-dropdown", switcher: "dropdown", singleLocale: false, nuxtVersion: "4.5.1" },
  { name: "i18n-list", switcher: "list", singleLocale: false, nuxtVersion: "4.5.1" },
];
const plausibleScriptId = "CertificationScriptId";

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function runWithoutNuxtDiagnostics(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}.`);
  }
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const diagnostics = [...new Set(output.match(/NUXT_E\d{4}/g) ?? [])];
  if (diagnostics.length > 0) {
    throw new Error(`Nuxt emitted runtime diagnostics during build: ${diagnostics.join(", ")}`);
  }
  const forbiddenWarnings = [
    /defaultLocale: .* is not one of the configured locales/u,
    /Some `vite\.optimizeDeps\.include` entries could not be resolved/u,
  ].filter((pattern) => pattern.test(output));
  if (forbiddenWarnings.length > 0) {
    throw new Error(
      `Packed consumer emitted a layer configuration warning: ${forbiddenWarnings.join(", ")}`,
    );
  }
}

function replaceRequired(source, search, replacement, label) {
  const found = typeof search === "string" ? source.includes(search) : search.test(source);
  if (!found) {
    throw new Error(`Could not prepare ${label}: expected source text was not found.`);
  }
  return source.replace(search, replacement);
}

function copyFixture(variant, directory) {
  mkdirSync(directory, { recursive: true });
  for (const entry of [
    "app",
    "public",
    "content.config.ts",
    "nuxt.config.ts",
    "site.json",
    "tsconfig.json",
  ]) {
    cpSync(resolve(docsApp, entry), resolve(directory, entry), { recursive: true });
  }
  if (variant.singleLocale) {
    cpSync(resolve(docsApp, "content/en/1.docs"), resolve(directory, "content/docs"), {
      recursive: true,
    });
    if (variant.blog !== false) {
      cpSync(resolve(docsApp, "content/en/2.blog"), resolve(directory, "content/2.blog"), {
        recursive: true,
      });
      cpSync(resolve(docsApp, "content/en/authors"), resolve(directory, "content/authors"), {
        recursive: true,
      });
    }
  } else {
    cpSync(resolve(docsApp, "content"), resolve(directory, "content"), { recursive: true });
  }

  const appConfigPath = resolve(directory, "app/app.config.ts");
  let appConfig = replaceRequired(
    readFileSync(appConfigPath, "utf8"),
    'docsSidebarSwitcher: "tabs"',
    `docsSidebarSwitcher: "${variant.switcher}"`,
    `${variant.name} sidebar configuration`,
  );
  if (variant.singleLocale) {
    appConfig = replaceRequired(
      appConfig,
      /    analytics: \{ plausible: \{ scriptId: "[A-Za-z0-9_-]+" \} \},/u,
      `    analytics: { plausible: { scriptId: "${plausibleScriptId}" } },`,
      `${variant.name} analytics configuration`,
    );
  }
  writeFileSync(appConfigPath, appConfig);

  const nuxtConfigPath = resolve(directory, "nuxt.config.ts");
  let nuxtConfig = replaceRequired(
    readFileSync(nuxtConfigPath, "utf8"),
    'extends: ["../layer"]',
    'extends: ["@lupinum/ginko-docs"]',
    `${variant.name} layer dependency`,
  );
  if (variant.usesLayerLocaleDefault) {
    nuxtConfig = replaceRequired(
      nuxtConfig,
      '  i18n: {\n    baseUrl: site.url,\n    locales: [\n      { code: "en", language: "en-US", name: "English" },\n      { code: "de", language: "de-AT", name: "Deutsch" },\n    ],\n  },\n',
      "",
      `${variant.name} layer locale default`,
    );
  }
  if (variant.singleLocale) {
    nuxtConfig = replaceRequired(
      nuxtConfig,
      '    i18n: {\n      fallback: { de: ["en"] },\n    },\n',
      "",
      `${variant.name} locale fallback`,
    );
  }

  writeFileSync(nuxtConfigPath, nuxtConfig);

  const contentConfigPath = resolve(directory, "content.config.ts");
  let contentConfig = readFileSync(contentConfigPath, "utf8");
  if (variant.singleLocale) {
    contentConfig = replaceRequired(
      contentConfig,
      'locales: ["en", "de"]',
      'locales: ["en"]',
      `${variant.name} content locales`,
    );
  }
  if (variant.blog === false) {
    contentConfig = replaceRequired(
      contentConfig,
      "blog: true",
      "blog: false",
      `${variant.name} blog configuration`,
    );
  }
  writeFileSync(contentConfigPath, contentConfig);

  writeFileSync(
    resolve(directory, "package.json"),
    `${JSON.stringify(
      {
        name: `ginko-docs-${variant.name}-fixture`,
        private: true,
        type: "module",
        dependencies: {
          "@lupinum/ginko-content": contentArchive ? `file:${contentArchive}` : contentVersion,
          "@lupinum/ginko-docs": `file:${archive[0]}`,
          nuxt: variant.nuxtVersion,
          vue: "^3.5.35",
          "vue-router": "^5.1.0",
        },
        devDependencies: { typescript: "^5.9.3", "vue-tsc": "^3.2.9" },
        packageManager: "pnpm@11.21.0",
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    resolve(directory, "pnpm-workspace.yaml"),
    [
      "minimumReleaseAge: 1440",
      "minimumReleaseAgeStrict: true",
      "minimumReleaseAgeIgnoreMissingTime: false",
      "",
      "allowBuilds:",
      "  esbuild: true",
      "  vue-demi: true",
      "",
    ].join("\n"),
  );
}

async function allocatePort() {
  const server = createServer();
  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolvePromise) => server.close(resolvePromise));
  if (!port) throw new Error("Could not allocate a certification port.");
  return port;
}

async function startServer(directory) {
  const port = await allocatePort();
  const baseURL = `http://127.0.0.1:${port}`;
  let output = "";
  const child = spawn("node", [".output/server/index.mjs"], {
    cwd: directory,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Fixture server exited early.\n${output}`);
    try {
      const response = await fetch(baseURL);
      if (response.ok) return { baseURL, child };
    } catch {
      // The server is still starting.
    }
    await delay(100);
  }
  child.kill("SIGKILL");
  throw new Error(`Fixture server did not start.\n${output}`);
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  for (let attempt = 0; attempt < 50 && child.exitCode === null; attempt += 1) await delay(100);
  if (child.exitCode === null) child.kill("SIGKILL");
}

function chromiumExecutable() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    chromium.executablePath(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const executable = candidates.find((entry) => entry && existsSync(entry));
  if (!executable)
    throw new Error("No Chromium executable is available for release certification.");
  return executable;
}

async function assertHeaderLayout(page, variant) {
  const overflow = await page.evaluate(() => {
    const header = document.querySelector("header");
    return header ? header.scrollWidth > header.clientWidth + 1 : false;
  });
  if (overflow) {
    throw new Error(
      `${variant.name} header overflowed horizontally at ${page.viewportSize()?.width}px.`,
    );
  }
}

async function certifyHeaderControls(page, variant) {
  await assertHeaderLayout(page, variant);

  const searchTrigger = page.getByRole("button", { name: /search/i }).first();
  await searchTrigger.click();
  const commandCenter = page.getByRole("dialog");
  await commandCenter.waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await commandCenter.waitFor({ state: "hidden" });

  const viewportWidth = page.viewportSize()?.width ?? 1440;
  if (viewportWidth >= 691) {
    const themeToggle = page.locator('header [role="switch"]').first();
    const initialTheme = await themeToggle.getAttribute("aria-checked");
    await themeToggle.click();
    await page.waitForFunction((previous) => {
      const toggle = document.querySelector('header [role="switch"]');
      return toggle?.getAttribute("aria-checked") !== previous;
    }, initialTheme);
  }

  await page.getByRole("link", { name: "GitHub" }).first().waitFor({ state: "visible" });
  await page.getByRole("link", { name: "Discord" }).first().waitFor({ state: "visible" });

  if (variant.singleLocale || viewportWidth < 691) return;

  const language = page.getByRole("button", { name: /language/i }).first();
  await language.click();
  await page.locator('a[lang="de"]').first().click();
  await page.waitForURL((url) => url.pathname.startsWith("/de/"));
  await page.locator('aside[data-variant="desktop"]').waitFor({ state: "visible" });
  await assertHeaderLayout(page, variant);
  await page.getByRole("link", { name: "GitHub" }).first().focus();
  await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "GitHub");
}

async function certifyBrowser(variant, directory) {
  const server = await startServer(directory);
  const browser = await chromium.launch({ executablePath: chromiumExecutable(), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const failures = [];
    if (variant.singleLocale) {
      await page.route(`https://plausible.io/js/pa-${plausibleScriptId}.js`, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/javascript",
          body: `window.plausible = (...args) => (window.__ginkoPlausibleEvents ??= []).push(args);`,
        }),
      );
    }
    page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" || /hydration/i.test(message.text())) {
        failures.push(`console ${message.type()}: ${message.text()}`);
      }
    });
    page.on("requestfailed", (request) => {
      if (new URL(request.url()).origin === server.baseURL) {
        failures.push(
          `request failed: ${request.failure()?.errorText || "unknown"} ${request.url()}`,
        );
      }
    });
    page.on("response", (response) => {
      if (new URL(response.url()).origin === server.baseURL && response.status() >= 400) {
        failures.push(`response ${response.status()}: ${response.url()}`);
      }
    });

    const startPath = variant.singleLocale ? "/docs" : "/docs/getting-started";
    if (variant.singleLocale) {
      const source = await fetch(`${server.baseURL}/docs/getting-started`).then((response) =>
        response.text(),
      );
      const scriptURL = `https://plausible.io/js/pa-${plausibleScriptId}.js`;
      if (!source.includes(scriptURL) || !source.includes("plausible.init()")) {
        throw new Error(`${variant.name} did not render the Plausible snippet in server HTML.`);
      }
    }
    await page.goto(`${server.baseURL}${startPath}`, { waitUntil: "networkidle" });
    const sidebar = page.locator('aside[data-variant="desktop"]');
    await sidebar.waitFor({ state: "visible" });
    await sidebar.locator(`[data-slot="docs-sidebar-${variant.switcher}"]`).waitFor({
      state: "visible",
    });
    const links = sidebar.locator('a[href^="/docs/"]');
    if ((await links.count()) === 0) throw new Error(`${variant.name} rendered no sidebar links.`);
    const destination = await links.evaluateAll((elements, currentPath) => {
      const link = elements.find((element) => element.getAttribute("href") !== currentPath);
      return link?.getAttribute("href") || null;
    }, new URL(page.url()).pathname);
    if (!destination) throw new Error(`${variant.name} rendered a link without a destination.`);
    await sidebar.locator(`a[href="${destination}"]`).first().click();
    await page.waitForURL((url) => url.pathname === destination);
    await sidebar
      .locator(`a[href="${destination}"][aria-current="page"][data-active="true"]`)
      .waitFor({
        state: "visible",
      });

    if (variant.singleLocale) {
      const plausibleScripts = page.locator(
        `script[src="https://plausible.io/js/pa-${plausibleScriptId}.js"]`,
      );
      await plausibleScripts.first().waitFor({ state: "attached" });
      if ((await plausibleScripts.count()) !== 1) {
        throw new Error(`${variant.name} rendered more than one Plausible tracker.`);
      }
      await page.getByRole("button", { name: "Yes", exact: true }).click();
      await page.getByText("Thanks for your feedback.", { exact: true }).waitFor();
      await page.waitForFunction(() =>
        window.__ginkoPlausibleEvents?.some(([event]) => event === "docs-feedback"),
      );
      const feedbackEvent = await page.evaluate(() =>
        window.__ginkoPlausibleEvents.find(([event]) => event === "docs-feedback"),
      );
      const props = feedbackEvent?.[1]?.props;
      const destinationPath = destination.replace(/\/$/, "") || "/";
      if (props?.path !== destinationPath || props?.helpful !== "yes" || props?.locale !== "en") {
        throw new Error(
          `${variant.name} emitted invalid docs feedback: ${JSON.stringify(feedbackEvent)}`,
        );
      }
    }

    if (variant.switcher === "list") {
      // The docs architecture is flat: sections switched via the list, with
      // headed groups inside each section (no collapsible folders in the
      // fixture content). Structural navigation therefore means group
      // headings render and the list switches between sections.
      if ((await sidebar.locator('[data-slot="docs-sidebar-group-title"]').count()) === 0) {
        throw new Error("The list fixture did not render a structural navigation group.");
      }
      const linksBefore = await links.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("href")),
      );
      await sidebar
        .locator('[data-slot="docs-sidebar-list"] button[aria-pressed="false"]')
        .first()
        .click();
      await page
        .waitForFunction((before) => {
          const sidebarElement = document.querySelector('aside[data-variant="desktop"]');
          const hrefs = [...(sidebarElement?.querySelectorAll('a[href^="/docs/"]') ?? [])].map(
            (element) => element.getAttribute("href"),
          );
          return JSON.stringify(hrefs) !== before;
        }, JSON.stringify(linksBefore))
        .catch(() => {
          throw new Error("The list fixture did not switch structural sections.");
        });
    }
    await certifyHeaderControls(page, variant);

    if (variant.singleLocale) {
      const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await mobile.goto(`${server.baseURL}/docs/getting-started`, { waitUntil: "networkidle" });
      await certifyHeaderControls(mobile, variant);
      await mobile.getByRole("button", { name: "Open menu" }).click();
      await mobile.getByRole("navigation", { name: "Mobile navigation" }).waitFor({
        state: "visible",
      });
      await mobile.getByRole("switch").first().click();
      await mobile.locator('a[href="https://lupinum.com/impressum"]').waitFor({
        state: "attached",
      });
      await mobile.locator('a[href="https://lupinum.com/datenschutz"]').waitFor({
        state: "attached",
      });
      await mobile.close();
    }
    if (failures.length)
      throw new Error(`${variant.name} browser failures:\n${failures.join("\n")}`);
  } finally {
    await browser.close();
    await stopServer(server.child);
  }
}

const temporaryRoot = mkdtempSync(resolve(tmpdir(), "ginko-docs-fixtures-"));
let certificationPassed = false;
try {
  for (const variant of variants) {
    const directory = resolve(temporaryRoot, variant.name);
    copyFixture(variant, directory);
    run("vp", ["install"], directory);
    run("vp", ["exec", "nuxi", "typecheck"], directory);
    runWithoutNuxtDiagnostics("vp", ["exec", "nuxt", "build"], directory);
    const lock = readFileSync(resolve(directory, "pnpm-lock.yaml"), "utf8");
    const installedContent = JSON.parse(
      readFileSync(resolve(directory, "node_modules/@lupinum/ginko-content/package.json"), "utf8"),
    );
    const contentVersions = new Set(
      [...lock.matchAll(/@lupinum\/ginko-content@([^:'()\s]+)[(:]/g)].map((match) => match[1]),
    );
    if (
      installedContent.version !== contentVersion ||
      (!contentArchive && (contentVersions.size !== 1 || !contentVersions.has(contentVersion)))
    ) {
      throw new Error(
        `${variant.name} did not resolve exactly one Ginko Content ${contentVersion} installation.`,
      );
    }
    await certifyBrowser(variant, directory);
    rmSync(directory, { recursive: true, force: true });
  }
  certificationPassed = true;
} finally {
  if (certificationPassed) {
    rmSync(temporaryRoot, { recursive: true, force: true });
  } else {
    console.error(`Failed certification fixture retained at ${temporaryRoot}`);
  }
}

const releaseArtifactPath = resolve(root, "layer/.pack/release-artifact.json");
const releaseArtifact = JSON.parse(readFileSync(releaseArtifactPath, "utf8"));
const docsHash = sha256(archive[0]);
if (releaseArtifact.tarball !== basename(archive[0]) || releaseArtifact.sha256 !== docsHash) {
  throw new Error("Certification input does not match the packed release artifact.");
}
writeFileSync(
  resolve(root, "layer/.pack/release-certification.json"),
  `${JSON.stringify(
    {
      packageName: layerManifest.name,
      packageVersion: layerManifest.version,
      commit: releaseArtifact.commit,
      tarball: releaseArtifact.tarball,
      sha256: docsHash,
      contentVersion,
      contentSource: contentArchive ? "tarball" : "registry",
      contentSha256: contentArchive ? sha256(contentArchive) : undefined,
      releaseEvidence: !contentArchive,
      lanes: variants.map((variant) => variant.name),
    },
    null,
    2,
  )}\n`,
);

console.log("Packed single-locale, i18n dropdown, and structural-list fixtures passed.");
