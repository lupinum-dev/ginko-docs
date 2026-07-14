import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { defaultLocale, localeFromPath, localizedPath } from "./i18n/locales";
import { i18nPages, localizedRoutes } from "./i18n/routes";
import { removeBlogPages } from "./modules/feature-routing";
import { routeSlugs } from "./shared/route-slugs";
import { contentComponentPolicy, contentComponentTags } from "./tags";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("ginko docs release guardrails", () => {
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
      url: "git+https://github.com/Mat4m0/lupinum-docs-shadcn.git",
      directory: "layer",
    });
    expect(manifest.publishConfig).toEqual({ access: "public" });
    expect(manifest.main).toBe("./nuxt.config.ts");
    expect(manifest.dependencies["@lupinum/ginko-content"]).toBe("0.3.0-rc.1");
    expect(manifest.exports["./content"]).toEqual({
      types: "./content.ts",
      import: "./content.js",
      default: "./content.js",
    });
    expect(read("layer/content.js")).toContain("function defineGinkoDocsConfig(options)");
    expect(manifest.exports["./app-config"]).toBe("./shared/types/app-config.ts");
    expect(manifest.exports["./components"]).toBe("./components.ts");
    expect(read("layer/README.md")).toContain("# Ginko Docs");
    expect(read("layer/LICENSE")).toContain("MIT License");

    const contentEntry = await import(pathToFileURL(join(root, "layer/content.js")).href);
    expect(contentEntry.defineGinkoDocsConfig).toBeTypeOf("function");
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
    expect(componentsEntry.ginkoDocsComponentTags.callout).toBe("MdcCallout");
    expect(componentsEntry.ginkoDocsComponentNames).toContain("MdcCallout");
    expect(componentsEntry.ginkoDocsComponentPolicy).toBe(contentComponentPolicy);
  });

  it("declares an explicit render policy for every custom MDC tag", () => {
    const customTags = Object.keys(contentComponentTags).filter((tag) => tag !== "img");
    expect(Object.keys(contentComponentPolicy.components).sort()).toEqual(customTags.sort());
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
      "router.resolve(linkHref).matched.length > 0",
    );
  });

  it("keeps the generated content entry synchronized with its TypeScript source", () => {
    const output = join(tmpdir(), `ginko-docs-content-${process.pid}.js`);
    try {
      execFileSync(
        "vp",
        [
          "exec",
          "esbuild",
          "layer/content.ts",
          "--bundle",
          "--platform=node",
          "--format=esm",
          "--packages=external",
          `--outfile=${output}`,
        ],
        { cwd: root, stdio: "pipe" },
      );
      execFileSync("vp", ["fmt", output], { cwd: root, stdio: "pipe" });
      expect(readFileSync(output, "utf8")).toBe(read("layer/content.js"));
    } finally {
      rmSync(output, { force: true });
    }
  });

  it("keeps strict output and agent routes enabled at the layer boundary", () => {
    const config = read("layer/nuxt.config.ts");
    expect(config).toContain("failOnError: true");
    expect(config).toContain("markdownNegotiation: true");
    expect(config).toContain('"/llms.txt"');
    expect(config).toContain('"/sitemap.xml"');
    expect(config).toContain('excludeAppSources: ["nuxt:prerender"]');
  });

  it("does not redistribute the commercial Pressura font", () => {
    expect(read("layer/app/assets/css/tailwind.css")).not.toContain("Pressura");
    expect(read("layer/nuxt.config.ts")).toContain('name: "Public Sans"');
  });

  it("runs the playground as a minimal consumer instead of a second theme", () => {
    expect(read("playground/nuxt.config.ts")).toContain('extends: ["../layer"]');
    expect(read("playground/content.config.ts")).toContain("defineGinkoDocsConfig");
    expect(read("playground/app/app.config.ts")).toContain("ginkoDocs");
  });

  it("keeps feedback disabled unless a consumer supplies an endpoint", () => {
    const defaults = read("layer/app/app.config.ts");
    expect(defaults).toContain("feedback: { enabled: false }");
  });
});
