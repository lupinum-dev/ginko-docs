import { execFileSync, spawn } from "node:child_process";
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
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playground = resolve(root, "playground");
const contentArchive = process.env.GINKO_CONTENT_TARBALL
  ? resolve(process.env.GINKO_CONTENT_TARBALL)
  : null;
if (contentArchive && !existsSync(contentArchive)) {
  throw new Error(`GINKO_CONTENT_TARBALL does not exist: ${contentArchive}`);
}
const archive = readdirSync(resolve(root, "layer/.pack"))
  .filter((entry) => entry.endsWith(".tgz"))
  .map((entry) => resolve(root, "layer/.pack", entry));

if (archive.length !== 1) throw new Error(`Expected one release archive, found ${archive.length}.`);

const variants = [
  { name: "single-tabs", switcher: "tabs", singleLocale: true },
  { name: "i18n-dropdown", switcher: "dropdown", singleLocale: false },
  { name: "i18n-list", switcher: "list", singleLocale: false },
];

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) {
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
    cpSync(resolve(playground, entry), resolve(directory, entry), { recursive: true });
  }
  if (variant.singleLocale) {
    cpSync(resolve(playground, "content/en/1.docs"), resolve(directory, "content/docs"), {
      recursive: true,
    });
    cpSync(resolve(playground, "content/en/2.blog"), resolve(directory, "content/2.blog"), {
      recursive: true,
    });
    cpSync(resolve(playground, "content/en/authors"), resolve(directory, "content/authors"), {
      recursive: true,
    });
  } else {
    cpSync(resolve(playground, "content"), resolve(directory, "content"), { recursive: true });
  }

  const appConfigPath = resolve(directory, "app/app.config.ts");
  writeFileSync(
    appConfigPath,
    replaceRequired(
      readFileSync(appConfigPath, "utf8"),
      'docsSidebarSwitcher: "tabs"',
      `docsSidebarSwitcher: "${variant.switcher}"`,
      `${variant.name} sidebar configuration`,
    ),
  );

  const nuxtConfigPath = resolve(directory, "nuxt.config.ts");
  let nuxtConfig = replaceRequired(
    readFileSync(nuxtConfigPath, "utf8"),
    'extends: ["../layer"]',
    'extends: ["@lupinum/ginko-docs"]',
    `${variant.name} layer dependency`,
  );
  if (variant.singleLocale) {
    nuxtConfig = replaceRequired(
      nuxtConfig,
      '      { code: "de", language: "de-AT", name: "Deutsch" },\n',
      "",
      `${variant.name} locale registry`,
    );
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
  writeFileSync(contentConfigPath, contentConfig);

  writeFileSync(
    resolve(directory, "package.json"),
    `${JSON.stringify(
      {
        name: `ginko-docs-${variant.name}-fixture`,
        private: true,
        type: "module",
        dependencies: {
          "@lupinum/ginko-content": contentArchive ? `file:${contentArchive}` : "0.3.0-rc.5",
          "@lupinum/ginko-docs": `file:${archive[0]}`,
          nuxt: "^4.4.8",
          vue: "^3.5.35",
          "vue-router": "^5.1.0",
        },
        devDependencies: { typescript: "^5.9.3", "vue-tsc": "^3.2.9" },
        packageManager: "pnpm@10.32.1",
      },
      null,
      2,
    )}\n`,
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

async function certifyBrowser(variant, directory) {
  const server = await startServer(directory);
  const browser = await chromium.launch({ executablePath: chromiumExecutable(), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const failures = [];
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
    await sidebar.locator(`a[href="${destination}"][aria-current="page"]`).waitFor({
      state: "visible",
    });

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
    if (!variant.singleLocale) {
      const language = page.getByRole("button", { name: /language/i }).first();
      await language.click();
      await page.locator('a[lang="de"]').first().click();
      await page.waitForURL((url) => url.pathname.startsWith("/de/"));
      await page.locator('aside[data-variant="desktop"]').waitFor({ state: "visible" });
    }
    if (failures.length)
      throw new Error(`${variant.name} browser failures:\n${failures.join("\n")}`);
  } finally {
    await browser.close();
    await stopServer(server.child);
  }
}

const temporaryRoot = mkdtempSync(resolve(tmpdir(), "ginko-docs-fixtures-"));
try {
  for (const variant of variants) {
    const directory = resolve(temporaryRoot, variant.name);
    copyFixture(variant, directory);
    run("vp", ["install"], directory);
    run("vp", ["exec", "nuxi", "typecheck"], directory);
    run("vp", ["exec", "nuxt", "build"], directory);
    const lock = readFileSync(resolve(directory, "pnpm-lock.yaml"), "utf8");
    const installedContent = JSON.parse(
      readFileSync(resolve(directory, "node_modules/@lupinum/ginko-content/package.json"), "utf8"),
    );
    const contentVersions = new Set(
      [...lock.matchAll(/@lupinum\/ginko-content@([^:'()\s]+)[(:]/g)].map((match) => match[1]),
    );
    if (
      installedContent.version !== "0.3.0-rc.5" ||
      (!contentArchive && (contentVersions.size !== 1 || !contentVersions.has("0.3.0-rc.5")))
    ) {
      throw new Error(
        `${variant.name} did not resolve exactly one Ginko Content rc.5 installation.`,
      );
    }
    await certifyBrowser(variant, directory);
    rmSync(directory, { recursive: true, force: true });
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log("Packed single-locale, i18n dropdown, and structural-list fixtures passed.");
