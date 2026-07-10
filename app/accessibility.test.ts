import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

function readVueFiles(dir: string): string[] {
  const files: string[] = [];

  function visit(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".vue")) {
        files.push(entryPath);
      }
    }
  }

  visit(join(appRoot, dir));
  return files;
}

describe("accessibility landmarks", () => {
  it("keeps the skip link and one main landmark owned by each page shell", () => {
    const header = readAppFile("app/components/site/SiteHeader.vue");
    const layouts = [
      "app/layouts/default.vue",
      "app/layouts/blog.vue",
      "app/layouts/marketing.vue",
    ];
    const docsLayout = readAppFile("app/layouts/docs.vue");
    const docsPageContent = readAppFile("app/features/docs/components/DocsPageContent.vue");

    expect(header).toContain('href="#main-content"');
    expect(header).toContain('t("nav.skip")');

    for (const layout of layouts) {
      const source = readAppFile(layout);
      expect(source).toContain("<main");
      expect(source).toContain('id="main-content"');
    }

    expect(docsLayout).not.toContain("<main");
    expect(docsPageContent).toContain("<main");
    expect(docsPageContent).toContain('id="main-content"');

    for (const page of readVueFiles("app/pages")) {
      expect(readFileSync(page, "utf8")).not.toContain("<main");
    }
  });

  it("keeps modal focus management on Reka dialog primitives", () => {
    const dialogContent = readAppFile("app/components/ui/dialog/DialogContent.vue");
    const cookieSettings = readAppFile("app/components/site/cookie/CookieSettings.vue");
    const chatLauncher = readAppFile("app/features/chat/components/ChatLauncher.vue");

    expect(dialogContent).toContain('from "reka-ui"');
    expect(dialogContent).toContain("DialogContent");
    expect(dialogContent).toContain("DialogClose");
    expect(cookieSettings).toContain("<DialogContent");
    expect(chatLauncher).toContain("<DialogContent");
  });

  it("keeps reduced motion and avoids decorative marketing-only backgrounds", () => {
    const css = readAppFile("app/assets/css/tailwind.css");
    const cta = readAppFile("app/components/marketing/CtaSection.vue");
    const hero = readAppFile("app/components/marketing/HeroSection.vue");

    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("transition-duration: 0.01ms");
    expect(css).toContain("animation-duration: 0.01ms");
    expect(cta).not.toMatch(/radial-gradient|blur-3xl|rounded-3xl/);
    expect(hero).not.toMatch(/radial-gradient|blur-3xl|rounded-3xl/);
  });
});
