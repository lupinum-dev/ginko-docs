import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { defaultOgImage, resolveOgImage } from "./seo";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

describe("seo metadata", () => {
  it("provides one default OG image fallback", () => {
    expect(defaultOgImage).toBe("/og-image.svg");
    expect(resolveOgImage()).toBe(defaultOgImage);
    expect(resolveOgImage("/custom.png")).toBe("/custom.png");
    expect(existsSync(join(appRoot, "public/og-image.svg"))).toBe(true);

    for (const file of ["app/app.vue"]) {
      expect(readAppFile(file)).toContain("defaultOgImage");
      expect(readAppFile(file)).not.toContain("og-image.png");
    }
  });

  it("keeps page metadata content-driven without nuxt-og-image in the core preset", () => {
    const packageJson = readAppFile("package.json");
    const docsPage = readAppFile("app/features/docs/components/DocsPageContent.vue");
    const blogPage = readAppFile("app/pages/blog/[slug].vue");

    expect(packageJson).not.toContain("nuxt-og-image");
    expect(docsPage).toContain("pageTitle");
    expect(docsPage).toContain("pageDescription");
    expect(blogPage).toContain("pageTitle");
    expect(blogPage).toContain("pageDescription");
  });
});
