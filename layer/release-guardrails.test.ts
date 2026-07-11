import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { defaultLocale, localeFromPath, localizedPath } from "./i18n/locales";
import { routeSlugs } from "./shared/route-slugs";

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
  });

  it("publishes source layer and typed consumer entrypoints", () => {
    const manifest = JSON.parse(read("layer/package.json"));
    expect(manifest.name).toBe("@lupinum/ginko-docs");
    expect(manifest.main).toBe("./nuxt.config.ts");
    expect(manifest.exports["./content"]).toBe("./content.ts");
    expect(manifest.exports["./app-config"]).toBe("./shared/types/app-config.ts");
  });

  it("keeps strict output and agent routes enabled at the layer boundary", () => {
    const config = read("layer/nuxt.config.ts");
    expect(config).toContain("failOnError: true");
    expect(config).toContain("markdownNegotiation: true");
    expect(config).toContain('"/llms.txt"');
    expect(config).toContain('"/sitemap.xml"');
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
