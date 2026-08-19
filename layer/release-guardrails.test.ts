import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { defaultLocale, localeFromPath, localizedPath } from "./i18n/locales";
import { i18nPages, localizedRoutes } from "./i18n/routes";
import { removeBlogPages } from "./modules/feature-routing";
import { isNuxtScriptsComponentDirectory } from "./modules/analytics-boundary";
import { routeSlugs } from "./shared/route-slugs";
import { contentComponentPolicy, contentComponentTags } from "./tags";
import { resolveIconifyIcon } from "./app/components/mdc/icons";
import { layerIconCollections, layerIconNames } from "./icon-bundle";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(path, entry.name);
    return entry.isDirectory() ? sourceFiles(entryPath) : [entryPath];
  });
}

function authoredProse(source: string) {
  const withoutFrontmatter = source.replace(/^---\n[\s\S]*?\n---\n?/, "");
  let inFence = false;

  return withoutFrontmatter
    .split("\n")
    .filter((line) => {
      if (/^\s*(?:`{3,}|~{3,})/.test(line)) {
        inFence = !inFence;
        return false;
      }
      return !inFence;
    })
    .join("\n");
}

function numericContentIdentity(contentRoot: string, path: string) {
  return relative(contentRoot, path)
    .replaceAll("\\", "/")
    .split("/")
    .map((segment) => {
      if (segment === ".navigation.yml") return "navigation";
      const order = segment.match(/^(\d+)\./)?.[1];
      if (!order) return segment;
      return `${segment.endsWith(".md") ? "page" : "directory"}:${order}`;
    })
    .join("/");
}

function unlabeledCodeFences(source: string) {
  const unlabeled: string[] = [];
  let closingFence: string | undefined;

  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (closingFence) {
      if (trimmed === closingFence) closingFence = undefined;
      continue;
    }

    const fence = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
    if (!fence) continue;
    closingFence = fence[1];
    if (!/^[a-z0-9_-]+\s+\[[^\]]+\]$/i.test(fence[2]?.trim() ?? "")) {
      unlabeled.push(line);
    }
  }

  return unlabeled;
}

describe("ginko docs release guardrails", () => {
  it("keeps the standard contributor intake files", () => {
    const trackedFiles = new Set(
      execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).trim().split("\n"),
    );
    for (const path of [
      ".github/ISSUE_TEMPLATE/bug.md",
      ".github/ISSUE_TEMPLATE/config.yml",
      ".github/ISSUE_TEMPLATE/documentation.md",
      ".github/ISSUE_TEMPLATE/proposal.md",
      ".github/pull_request_template.md",
    ]) {
      expect(trackedFiles.has(path), `${path} must be tracked`).toBe(true);
    }

    const pullRequestTemplate = read(".github/pull_request_template.md");
    expect(pullRequestTemplate).toContain(
      "- [ ] I ran `pnpm verify`, or I explained why it does not apply.",
    );
    expect(pullRequestTemplate).toContain(
      "- [ ] I updated versions, migration guidance, and compatibility notes when the public contract changed.",
    );
  });

  it("keeps the production documentation services configured", () => {
    const config = read("docs/app/app.config.ts");
    for (const marker of [
      'plausible: { scriptId: "7B8poD6ZSLVeKsR3G6JHF" }',
      "feedback: { enabled: true }",
      "https://discord.gg/RPH6SeA36N",
      "https://lupinum.com/impressum",
      "https://lupinum.com/datenschutz",
    ]) {
      expect(config).toContain(marker);
    }
  });

  it("uses English as the canonical unprefixed locale", () => {
    expect(defaultLocale).toBe("en");
    expect(localizedPath("en", "/docs")).toBe("/docs");
    expect(localizedPath("de", "/dokumentation")).toBe("/de/dokumentation");
    expect(localeFromPath("/docs/introduction")).toBe("en");
    expect(localeFromPath("/de/dokumentation/einfuehrung")).toBe("de");
  });

  it("keeps translated route mounts in one shared source", () => {
    expect(routeSlugs.docs).toEqual({ en: "/docs", de: "/dokumentation" });
    expect(routeSlugs.blog).toEqual({ en: "/blog", de: "/blog" });
    expect(localizedRoutes.en).toEqual({
      home: routeSlugs.home.en,
      docs: routeSlugs.docs.en,
      blog: routeSlugs.blog.en,
    });
    expect(localizedRoutes.de).toEqual({
      home: routeSlugs.home.de,
      docs: routeSlugs.docs.de,
      blog: routeSlugs.blog.de,
    });
    expect(i18nPages["docs-slug"]).toEqual({
      en: `${routeSlugs.docs.en}/[...slug]`,
      de: `${routeSlugs.docs.de}/[...slug]`,
    });
  });

  it("publishes source layer and typed consumer entrypoints", async () => {
    const manifest = JSON.parse(read("layer/package.json"));
    expect(manifest.name).toBe("@lupinum/ginko-docs");
    expect(manifest.description).toBeTruthy();
    expect(manifest.license).toBe("MIT");
    expect(manifest.repository).toEqual({
      type: "git",
      url: "git+https://github.com/lupinum-dev/ginko-docs.git",
      directory: "layer",
    });
    expect(manifest.publishConfig).toEqual({ access: "public" });
    expect(manifest.main).toBe("./nuxt.config.ts");
    expect(read("layer/nuxt.config.ts")).toContain(`version: "${manifest.version}"`);
    expect(manifest.dependencies["@lupinum/ginko-content"]).toBeUndefined();
    expect(manifest.peerDependencies["@lupinum/ginko-content"]).toBe(">=0.4.0-rc.2 <0.5.0");
    expect(manifest.dependencies.vue).toBeUndefined();
    expect(manifest.dependencies["vue-router"]).toBeUndefined();
    expect(manifest.peerDependencies.vue).toBe("^3.5.35");
    expect(manifest.peerDependencies["vue-router"]).toBe("^5.1.0");
    expect(manifest.exports["./content"]).toEqual({
      types: "./content.ts",
      import: "./content.js",
      default: "./content.js",
    });
    expect(read("layer/content.js")).toContain("function defineGinkoDocsConfig(options)");
    expect(manifest.exports["./app-config"]).toBe("./shared/types/app-config.ts");
    expect(manifest.exports["./nuxt-config"]).toBe("./shared/types/nuxt-config.ts");
    expect(manifest.exports["./components"]).toBe("./components.ts");
    expect(manifest.files).toContain("icon-bundle.ts");
    expect(read("layer/README.md")).toContain('<h1 align="center">@lupinum/ginko-docs</h1>');
    expect(read("layer/LICENSE")).toContain("MIT License");

    const contentEntry = await import(pathToFileURL(join(root, "layer/content.js")).href);
    expect(contentEntry.defineGinkoDocsConfig).toBeTypeOf("function");
  });

  it("publishes only a certified release artifact for the exact tag", () => {
    const workflow = read(".github/workflows/publish.yml");
    const certification = read("scripts/certify-packed-fixtures.mjs");

    expect(workflow).toContain('test -z "$tag_sha" || test "$tag_sha" = "$GITHUB_SHA"');
    expect(workflow).toContain('test "$tag_sha" = "$GITHUB_SHA"');
    expect(workflow).toContain('gh release edit "v$RELEASE_VERSION"');
    expect(workflow).toContain("environment: npm");
    expect(workflow).toContain("id-token: write");
    expect(workflow).toContain("'--ignore-scripts', '--provenance'");
    expect(workflow).not.toContain("NPM_TOKEN");
    expect(certification).toContain("minimumReleaseAge: 1440");
    expect(certification).not.toContain("minimumReleaseAgeExclude");
  });

  it("publishes package previews only for trusted repository branches", () => {
    const workflow = read(".github/workflows/package-preview.yml");
    const rootManifest = JSON.parse(read("package.json"));

    expect(workflow).toContain(
      "github.event.pull_request.head.repo.full_name == github.repository",
    );
    expect(workflow).toContain("ref: ${{ github.event.pull_request.head.sha || github.sha }}");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain("pnpm exec pkg-pr-new publish");
    expect(workflow).toContain("node scripts/build-package-preview.mjs");
    expect(rootManifest.devDependencies["pkg-pr-new"]).toBe("0.0.87");
  });

  it("types nested app-config overrides and keeps consumer config on the typed boundary", () => {
    const declarations = read("layer/index.d.ts");
    const layerConfig = read("layer/nuxt.config.ts");
    const docsConfig = read("docs/app/app.config.ts");

    expect(declarations).toContain("type GinkoDocsAppConfigInput<T>");
    expect(declarations).toContain("ginkoDocs?: GinkoDocsAppConfigInput<GinkoDocsAppConfig>");
    expect(declarations).toContain("interface NuxtConfig");
    expect(declarations).toContain("ginkoDocs?: GinkoDocsNuxtConfig");
    expect(layerConfig).not.toContain("autoImport: false");
    expect(docsConfig).toContain("export default defineAppConfig({");
    expect(docsConfig).not.toContain("eyebrow");
    expect(docsConfig).not.toContain("localeSwitcher");
  });

  it("documents portable shared site data instead of loader-specific TypeScript imports", () => {
    const publicDocs = [
      read("README.md"),
      read("layer/README.md"),
      ...sourceFiles(join(root, "docs/content"))
        .filter((path) => path.endsWith(".md"))
        .map((path) => readFileSync(path, "utf8")),
    ].join("\n");

    expect(publicDocs).not.toContain("site.ts");
    expect(publicDocs).not.toContain('from "./site"');
    expect(publicDocs).not.toContain('from "../site"');
    expect(publicDocs).toContain("site.json");
    expect(publicDocs).toContain('with { type: "json" }');
  });

  it("exposes Nuxt-native customization seams without parallel component lookup", async () => {
    const config = read("layer/nuxt.config.ts");
    expect(config).toContain('"SiteHeader.vue"');
    expect(config).toContain('pattern: "DocsSidebar.vue"');

    for (const layout of ["default", "docs", "blog"]) {
      expect(read(`layer/app/layouts/${layout}.vue`)).not.toContain(
        'from "#ginko-docs/components/site/',
      );
    }
    expect(read("layer/app/layouts/docs.vue")).not.toContain(
      'from "#ginko-docs/features/docs/components/DocsSidebar.vue"',
    );

    const componentsEntry = await import(pathToFileURL(join(root, "layer/components.ts")).href);
    expect(componentsEntry.ginkoDocsComponentTags.note).toBe("MdcNote");
    expect(componentsEntry.ginkoDocsComponentTags.excerpt).toBe("MdcExcerpt");
    expect(componentsEntry.ginkoDocsComponentNames).toContain("MdcCards");
    expect(componentsEntry.ginkoDocsComponentPolicy).toBe(contentComponentPolicy);
  });

  it("exposes only the canonical greenfield component tags", () => {
    const removed = [
      "alert",
      "callout",
      "danger",
      "warn",
      "passage",
      "card-group",
      "read-more-group",
      "file",
      "folder",
      "field",
      "field-group",
      "doc-img",
      "quiz-option",
      "step",
      "shortcut",
    ];
    expect(Object.keys(contentComponentTags)).toHaveLength(33);
    expect(removed.every((tag) => !(tag in contentComponentTags))).toBe(true);
  });

  it("declares an explicit render policy for every custom MDC tag", () => {
    const customTags = Object.keys(contentComponentTags).filter((tag) => tag !== "img");
    expect(Object.keys(contentComponentPolicy.components).sort()).toEqual(customTags.sort());
  });

  it("preserves authored accordion trees across disclosure cycles", () => {
    expect(read("layer/app/components/mdc/MdcAccordion.vue")).toContain(':unmount-on-hide="false"');
  });

  it("accepts both Iconify and Nuxt icon names in MDC props", () => {
    expect(resolveIconifyIcon("lucide:server")).toBe("lucide:server");
    expect(resolveIconifyIcon("server")).toBe("lucide:server");
    expect(resolveIconifyIcon("i-lucide-server")).toBe("lucide:server");
  });

  it("uses the resolved blog collection as the only blog route authority", () => {
    const enabled = [{ path: "/" }, { path: "/blog" }, { path: "/blog/[slug]" }];
    removeBlogPages(enabled, true);
    expect(enabled.map((page) => page.path)).toEqual(["/", "/blog", "/blog/[slug]"]);

    const disabled = [{ path: "/" }, { path: "/blog" }, { path: "/blog/[slug]" }];
    removeBlogPages(disabled, false);
    expect(disabled.map((page) => page.path)).toEqual(["/"]);

    expect(read("layer/shared/types/app-config.ts")).not.toContain("blog: boolean");
    expect(read("layer/app/composables/useSiteNavigation.ts")).toContain(
      "router.getRoutes().some((route) => route.path === blogPath.value)",
    );
  });

  it("keeps the generated content entry synchronized with its TypeScript source", () => {
    const outputDir = join(tmpdir(), `ginko-docs-content-${process.pid}`);
    const output = join(outputDir, "content.js");
    try {
      execFileSync("vp", ["pack", "--out-dir", outputDir], { cwd: root, stdio: "pipe" });
      execFileSync("vp", ["fmt", output], { cwd: root, stdio: "pipe" });
      expect(readFileSync(output, "utf8")).toBe(read("layer/content.js"));
    } finally {
      rmSync(outputDir, { force: true, recursive: true });
    }
  });

  it("keeps strict output and agent routes enabled at the layer boundary", () => {
    const config = read("layer/nuxt.config.ts");
    // The content cache route emits a link page during prerender; crawling it
    // is what prerenders every content page under a standard `nuxt build`.
    expect(config).toContain("crawlLinks: true");
    expect(config).toContain("failOnError: true");
    expect(config).toContain('validation: "error"');
    expect(config).toContain("markdownNegotiation: true");
    expect(config).toContain('"/llms.txt"');
    expect(config).toContain('"/sitemap.xml"');
    expect(config).toContain('excludeAppSources: ["nuxt:prerender"]');
  });

  it("keeps Vue and its router as singletons across linked consumers", () => {
    expect(read("layer/nuxt.config.ts")).toContain(
      'dedupe: ["@lupinum/ginko-content", "vue", "vue-router"]',
    );
  });

  it("bundles layer and consumer icons without a runtime service", () => {
    const config = read("layer/nuxt.config.ts");
    expect(config).toContain('provider: "none"');
    expect(config).toContain("fallbackToApi: false");
    expect(config).toContain("icons: [...layerIconNames]");
    expect(config).toContain("vue,js,mjs,cjs,ts,jsx,tsx,md,mdc,mdx,yml,yaml");
    expect(config).toContain('"**/.navigation.{yml,yaml}"');
    expect(config).toContain('".git"');
    expect(config).not.toContain('".*"');

    const iconPattern = /\b(?:i-)?(circle-flags|logos|lucide)[:-]([a-z0-9-]+)\b/g;
    const sourceRoots = ["app", "i18n", "shared"].map((path) => join(root, "layer", path));
    const source = [...sourceRoots.flatMap(sourceFiles), join(root, "layer/tags.ts")].map((path) =>
      readFileSync(path, "utf8"),
    );
    const referenced = new Set(
      source.flatMap((contents) =>
        [...contents.matchAll(iconPattern)].map((match) => `${match[1]}:${match[2]}`),
      ),
    );

    expect([...referenced].filter((icon) => !layerIconNames.includes(icon as never))).toEqual([]);

    const bundledCollections = new Map(
      layerIconCollections.map((collection) => [collection.prefix, collection]),
    );
    const consumerSource = sourceFiles(join(root, "docs/app")).map((path) =>
      readFileSync(path, "utf8"),
    );
    const consumerIcons = new Set(
      consumerSource.flatMap((contents) =>
        [...contents.matchAll(iconPattern)].map((match) => `${match[1]}:${match[2]}`),
      ),
    );
    expect(
      [...consumerIcons].filter((icon) => {
        const [prefix, name] = icon.split(":");
        const collection = prefix ? bundledCollections.get(prefix) : undefined;
        return !name || (!collection?.icons[name] && !collection?.aliases?.[name]);
      }),
    ).toEqual([]);
  });

  it("does not redistribute the commercial Pressura font", () => {
    expect(read("layer/app/assets/css/tailwind.css")).not.toContain("Pressura");
    expect(read("layer/nuxt.config.ts")).toContain('name: "Public Sans"');
  });

  it("runs the documentation app as a minimal consumer instead of a second theme", () => {
    expect(read("docs/nuxt.config.ts")).toContain('extends: ["../layer"]');
    expect(read("docs/content.config.ts")).toContain("defineGinkoDocsConfig");
    expect(read("docs/app/app.config.ts")).toContain("ginkoDocs");
  });

  it("keeps the documentation app documentation bilingual, task-first, and free of fixture prose", () => {
    const roots = [
      join(root, "docs/content/en/1.docs"),
      join(root, "docs/content/de/1.dokumentation"),
    ];
    const pagesByLocale = roots.map((contentRoot) =>
      sourceFiles(contentRoot).filter((path) => path.endsWith(".md")),
    );
    const localeRoots = [join(root, "docs/content/en"), join(root, "docs/content/de")];
    const authoredPagesByLocale = localeRoots.map((contentRoot) =>
      sourceFiles(contentRoot).filter((path) => path.endsWith(".md")),
    );

    expect(pagesByLocale[0]?.length).toBeGreaterThanOrEqual(20);
    expect(pagesByLocale[1]?.length).toBe(pagesByLocale[0]?.length);
    expect(authoredPagesByLocale[1]?.length).toBe(authoredPagesByLocale[0]?.length);

    const pageIdentities = roots.map((contentRoot, index) =>
      (pagesByLocale[index] ?? []).map((path) => numericContentIdentity(contentRoot, path)).sort(),
    );
    expect(new Set(pageIdentities[0]).size).toBe(pageIdentities[0]?.length);
    expect(pageIdentities[1]).toEqual(pageIdentities[0]);

    const authoredIdentities = localeRoots.map((contentRoot, index) =>
      (authoredPagesByLocale[index] ?? [])
        .map((path) => numericContentIdentity(contentRoot, path))
        .sort(),
    );
    expect(authoredIdentities[1]).toEqual(authoredIdentities[0]);

    const navigationIdentities = roots.map((contentRoot) =>
      sourceFiles(contentRoot)
        .filter((path) => path.endsWith(".navigation.yml"))
        .map((path) => numericContentIdentity(contentRoot, path))
        .sort(),
    );
    expect(navigationIdentities[1]).toEqual(navigationIdentities[0]);

    for (const [index, contentRoot] of roots.entries()) {
      const navigation = sourceFiles(contentRoot)
        .filter((path) => path.endsWith(".navigation.yml"))
        .map((path) => readFileSync(path, "utf8"));
      expect(navigation.filter((source) => source.includes("sidebar: section"))).toHaveLength(2);
      expect(navigation.filter((source) => source.includes("sidebar: group"))).toHaveLength(7);

      for (const path of authoredPagesByLocale[index] ?? []) {
        const source = readFileSync(path, "utf8");
        const prose = authoredProse(source);
        expect(source).toMatch(/^---\n/);
        expect(source).toMatch(/^title: .+$/m);
        expect(source).toMatch(/^description: .+$/m);
        expect(source).not.toMatch(/^navigation\./m);
        expect(unlabeledCodeFences(source)).toEqual([]);
        expect(prose).not.toMatch(/^#\s+/m);
        expect(prose).not.toMatch(
          /^##\s+(?:What's next|Next steps|Related|See also|Conclusion|Summary|Wie geht es weiter\??|Nächste Schritte|Verwandte Seiten|Siehe auch|Fazit|Zusammenfassung)\s*$/gim,
        );
        expect(prose).not.toMatch(
          /acceptance test|this page proves|what to verify|explore the proof|Akzeptanzkriterien|Verifikationsziele|Diese Seite beweist/i,
        );
        expect(prose).not.toMatch(/\buseContent(?:Tree|Many|Variants|Navigation)\b/);
        expect(prose).not.toMatch(/\bvp\s+(?:run|test|check|build|pack|fmt)\b/);
      }
    }
  });

  it("keeps feedback disabled until a consumer opts in", () => {
    const defaults = read("layer/app/app.config.ts");
    expect(defaults).toContain("feedback: { enabled: false }");
  });

  it("keeps release-facing installation examples on the package version", () => {
    const version = JSON.parse(read("layer/package.json")).version;
    const contentVersion = JSON.parse(read("package.json")).devDependencies[
      "@lupinum/ginko-content"
    ];
    const publicDocs = [
      read("README.md"),
      read("layer/README.md"),
      read("docs/app/app.config.ts"),
      ...sourceFiles(join(root, "docs/content"))
        .filter((path) => path.endsWith(".md"))
        .map((path) => readFileSync(path, "utf8")),
    ].join("\n");
    const documentedVersions = [
      ...publicDocs.matchAll(/@lupinum\/ginko-docs@(\d+\.\d+\.\d+(?:-[a-z0-9.]+)?)/g),
    ].map((match) => match[1]);

    expect(documentedVersions.length).toBeGreaterThan(0);
    expect(new Set(documentedVersions)).toEqual(new Set([version]));
    const documentedContentVersions = [
      ...publicDocs.matchAll(/@lupinum\/ginko-content@(\d+\.\d+\.\d+(?:-[a-z0-9.]+)?)/g),
    ].map((match) => match[1]);
    expect(documentedContentVersions.length).toBeGreaterThan(0);
    expect(new Set(documentedContentVersions)).toEqual(new Set([contentVersion]));
  });

  it("keeps public READMEs on the shared Lupinum structure", () => {
    const contracts = new Map([
      [
        "README.md",
        [
          "Why use Ginko Docs?",
          "When to use it",
          "Requirements",
          "Installation",
          "Quick start",
          "Core concepts",
          "Documentation",
          "Contributing and development",
          "Support and security",
          "License",
        ],
      ],
      [
        "layer/README.md",
        [
          "Purpose",
          "Requirements",
          "Installation",
          "Quick start",
          "Exports",
          "Documentation",
          "Support and security",
          "License",
        ],
      ],
    ]);

    for (const [path, expectedHeadings] of contracts) {
      const source = read(path);
      const headings = [...source.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
      expect(headings).toEqual(expectedHeadings);
      expect(source.match(/<h1 align="center">/g)).toHaveLength(1);
      expect(source).not.toMatch(/^# /m);
      expect(source).toMatch(/<img [^>]*width="128"/);
      expect(source).toContain("img.shields.io/npm/v/");
      expect(source).toContain("actions/workflows/ci.yml");
      expect(source).toContain("license-MIT");
      expect(source).toContain("https://ginko-docs.lupinum.com");
      expect(source).toContain("https://discord.gg/RPH6SeA36N");
      expect(source).not.toMatch(/\b(?:TODO|TBD|lorem ipsum|placeholder)\b/i);
    }
  });

  it("keeps legal links explicit and renders them in the shared footer", () => {
    const defaults = read("layer/app/app.config.ts");
    const footer = read("layer/app/components/site/SiteFooter.vue");
    const docsConfig = read("docs/app/app.config.ts");

    expect(defaults).toContain("legalLinks: []");
    expect(footer).toContain('v-for="link in site.legalLinks"');
    expect(docsConfig).toContain("https://lupinum.com/impressum");
    expect(docsConfig).toContain("https://lupinum.com/datenschutz");
  });

  it("uses the current site-specific Plausible tracker", () => {
    const analytics = read("layer/app/composables/useGinkoAnalytics.ts");
    const types = read("layer/shared/types/app-config.ts");

    expect(analytics).toContain("plausible?.scriptId?.trim()");
    expect(analytics).toContain("useScriptPlausibleAnalytics({");
    expect(analytics).toContain("scriptId,");
    expect(analytics).toContain('key: "plausibleAnalytics"');
    expect(analytics).toContain("plausible.init()");
    expect(analytics).toContain("scriptOptions: { bundle: false }");
    expect(analytics).toContain('typeof plausible !== "function"');
    expect(types).toContain("scriptId?: string");
    expect(types).not.toContain("GinkoDocsPlausibleExtension");
    expect(analytics).not.toContain("extension:");
    expect(analytics).not.toContain("scriptInput:");
  });

  it("keeps image zoom scoped to an interruptible shared-layout animation", () => {
    const manifest = JSON.parse(read("layer/package.json"));
    const dialog = read("layer/app/components/content/ImageZoomDialog.vue");
    const motion = read("layer/app/components/content/imageZoom.ts");
    const styles = read("layer/app/assets/css/tailwind.css");

    expect(manifest.dependencies["motion-v"]).toBe("^2.3.0");
    expect(dialog).toContain(":layout-id");
    expect(motion).toContain("useReducedMotion");
    expect(dialog).not.toContain("startViewTransition");
    expect(styles).not.toContain("view-transition-name: zoom-img");
  });

  it("routes plain markdown images through NuxtImg with the shared zoom dialog", () => {
    const proseImg = read("layer/app/components/prose/ProseImg.vue");

    expect(proseImg).toContain('resolveComponent("NuxtImg")');
    expect(proseImg).toContain("ImageZoomDialog");
    expect(proseImg).toContain("config.images?.zoom !== false");
    expect(proseImg).toContain("content-prose-image");
    // A bare ![...] lives inside <p>; the zoom trigger must stay phrasing content.
    expect(proseImg).not.toContain("<figure");
  });

  it("ships safe defaults for navigation, banner, and integrations", () => {
    const defaults = read("layer/app/app.config.ts");
    // Header social icons stay off so an upgrade never adds links to a site's bar.
    expect(defaults).toContain('nav: { links: "auto", socialIcons: false }');
    expect(defaults).toContain("enabled: false");
    expect(defaults).toContain("showOnLanding: true");
    expect(defaults).toContain('ogImage: { enabled: true, component: "GinkoDocs" }');
    expect(defaults).toContain("markdownActions: { chatGpt: true, claude: true, mcp: true }");
    expect(defaults).toContain("images: { zoom: true }");
    expect(defaults).toContain("toc: { depth: 3 }");
    // Analytics stays off unless a consumer configures a Plausible script ID.
    expect(defaults).not.toContain("analytics:");
  });

  it("generates social images at build time instead of serving SVG at runtime", () => {
    const config = read("layer/nuxt.config.ts");
    expect(config).toContain('"nuxt-og-image"');
    expect(config).toContain('"@nuxt/scripts"');
    expect(config).toContain("zeroRuntime: true");
    // Satori requires the renderer suffix and a globally registered font.
    expect(readdirSync(join(root, "layer/app/components/OgImage"))).toContain(
      "GinkoDocs.satori.vue",
    );
    expect(config).toContain('"@nuxt/fonts"');
    expect(config).toContain("families: publicSansFamilies");
    expect(config).toContain("google: false");
    expect(config).toContain("fontsource: false");
    expect(config).toContain("data:font/woff;base64");
    for (const weight of [400, 500, 600, 700]) {
      expect(
        existsSync(
          join(root, `layer/public/fonts/public-sans/public-sans-${weight}-normal-latin.woff`),
        ),
      ).toBe(true);
    }
    expect(config).toContain('join(root, "modules/analytics-boundary")');
    expect(config).toContain("concurrency: 1");
    // The legacy SVG endpoint must stay deleted: SVG og:images never render on
    // social platforms.
    expect(() => read("layer/server/api/og.ts")).toThrow();
  });

  it("keeps unused Nuxt Scripts components outside consumer bundles", () => {
    expect(
      isNuxtScriptsComponentDirectory(
        "/workspace/node_modules/.pnpm/@nuxt+scripts@1.3.3/node_modules/@nuxt/scripts/dist/runtime/components",
      ),
    ).toBe(true);
    expect(isNuxtScriptsComponentDirectory("/workspace/layer/app/components")).toBe(false);
  });

  it("registers the bare docs root as a localized redirect page", () => {
    expect(i18nPages.docs).toEqual({
      en: routeSlugs.docs.en,
      de: routeSlugs.docs.de,
    });
  });
});
