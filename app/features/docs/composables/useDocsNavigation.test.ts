import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { contentComponentTags } from "@lupinum/content-components/tags";
import { describe, expect, it } from "vite-plus/test";
import { getDocsNavigationGroups, type DocsNavigationSection } from "../docs-navigation";
import { flattenTocLinks, formatContentDate } from "../../../utils/content";

const contentRoot = join(process.cwd(), "content");

function readContentFiles(dir: string, extension: string): string[] {
  const files: string[] = [];

  function visit(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const entryPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(entryPath);
      }
    }
  }

  visit(join(contentRoot, dir));
  return files;
}

function readScalar(source: string, key: string): string {
  const value = source.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
  return value.replace(/^['"]|['"]$/g, "");
}

function readFrontmatter(source: string): string {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
}

describe("content UI adapters", () => {
  it("groups docs navigation without creating a second route source", () => {
    const section: DocsNavigationSection = {
      id: "/docs/essentials",
      title: "Essentials",
      path: "/docs/essentials",
      sidebar: "section",
      children: [
        {
          id: "/docs/essentials/markdown-syntax",
          title: "Markdown Syntax",
          path: "/docs/essentials/markdown-syntax",
          children: [],
        },
        {
          id: "/docs/essentials/content-rendering",
          title: "Content Rendering",
          path: "/docs/essentials/content-rendering",
          sidebar: "group",
          children: [
            {
              id: "/docs/essentials/content-rendering/component-tags",
              title: "Component Tags",
              path: "/docs/essentials/content-rendering/component-tags",
              badge: "Optional",
              children: [],
            },
          ],
        },
      ],
    };

    const groups = getDocsNavigationGroups(section);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.items.map((item) => item.path)).toEqual([
      "/docs/essentials",
      "/docs/essentials/markdown-syntax",
    ]);
    expect(groups[1]?.title).toBe("Content Rendering");
    expect(groups[1]?.items.map((item) => item.path)).toEqual([
      "/docs/essentials/content-rendering",
      "/docs/essentials/content-rendering/component-tags",
    ]);
  });

  it("supports folder group titles without requiring index pages", () => {
    const section: DocsNavigationSection = {
      id: "/docs/essentials",
      title: "Essentials",
      path: "/docs/essentials",
      sidebar: "section",
      children: [
        {
          id: "/docs/essentials/content-rendering",
          title: "Rich Rendering",
          icon: "lucide:brush-cleaning",
          sidebar: "group",
          children: [
            {
              id: "/docs/essentials/content-rendering/component-tags",
              title: "Component Tags",
              path: "/docs/essentials/content-rendering/component-tags",
              children: [],
            },
          ],
        },
      ],
    };

    const groups = getDocsNavigationGroups(section);

    expect(groups[1]?.title).toBe("Rich Rendering");
    expect(groups[1]?.icon).toBe("lucide:brush-cleaning");
    expect(groups[1]?.items.map((item) => item.path)).toEqual([
      "/docs/essentials/content-rendering/component-tags",
    ]);
  });

  it("keeps docs navigation metadata in content files", () => {
    const docsYamlFiles = [
      ...readContentFiles("de/1.dokumentation", ".yml"),
      ...readContentFiles("en/1.docs", ".yml"),
    ];

    expect(docsYamlFiles.map((file) => basename(file))).toContain(".navigation.yml");

    const gettingStarted = readFrontmatter(
      readFileSync(join(contentRoot, "de/1.dokumentation/1.erste-schritte/1.index.md"), "utf8"),
    );
    const essentials = readFrontmatter(
      readFileSync(join(contentRoot, "de/1.dokumentation/2.grundlagen/index.md"), "utf8"),
    );
    const contentRendering = readFrontmatter(
      readFileSync(
        join(contentRoot, "de/1.dokumentation/2.grundlagen/3.inhalte-rendern/1.index.md"),
        "utf8",
      ),
    );
    const gettingStartedNavigation = readFileSync(
      join(contentRoot, "de/1.dokumentation/1.erste-schritte/.navigation.yml"),
      "utf8",
    );
    const essentialsNavigation = readFileSync(
      join(contentRoot, "de/1.dokumentation/2.grundlagen/.navigation.yml"),
      "utf8",
    );
    const contentRenderingNavigation = readFileSync(
      join(contentRoot, "de/1.dokumentation/2.grundlagen/3.inhalte-rendern/.navigation.yml"),
      "utf8",
    );

    expect(readScalar(gettingStarted, "sidebar")).toBe("");
    expect(readScalar(essentials, "sidebar")).toBe("");
    expect(readScalar(contentRendering, "sidebar")).toBe("");
    expect(readScalar(gettingStartedNavigation, "sidebar")).toBe("section");
    expect(readScalar(essentialsNavigation, "sidebar")).toBe("section");
    expect(readScalar(contentRenderingNavigation, "sidebar")).toBe("group");

    for (const file of docsYamlFiles) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/^section:/m);
      expect(source).not.toMatch(/^group:/m);
    }

    const docsFiles = [
      ...readContentFiles("de/1.dokumentation", ".md"),
      ...readContentFiles("en/1.docs", ".md"),
    ];

    const docsSource = docsFiles.map((file) => readFileSync(file, "utf8")).join("\n");

    expect(docsSource).toContain("icon: logos:vue");
    expect(docsSource).not.toMatch(/^icon: i-[a-z0-9-]+-/m);
  });

  it("keeps operations recipe folders out of the default docs content", () => {
    expect(existsSync(join(contentRoot, "de/1.dokumentation/3.betrieb"))).toBe(false);
    expect(existsSync(join(contentRoot, "en/1.docs/3.operations"))).toBe(false);
  });

  it("keeps the markdown component registry ready for the full starter block catalog", () => {
    const nuxtConfig = readFileSync(join(process.cwd(), "nuxt.config.ts"), "utf8");
    const componentModule = readFileSync(
      join(process.cwd(), "packages/content-components/src/module.ts"),
      "utf8",
    );

    expect(nuxtConfig).toContain("@lupinum/content-components");
    expect(nuxtConfig).not.toContain("...contentComponentTags");
    expect(componentModule).toContain("...contentComponentTags");
    expect(contentComponentTags).toMatchObject({
      accordion: "MdcAccordion",
      "accordion-item": "MdcAccordionItem",
      alert: "MdcAlert",
      callout: "MdcCallout",
      card: "MdcCard",
      "card-group": "MdcCardGroup",
      center: "MdcCenter",
      column: "MdcColumn",
      "doc-img": "MdcDocImg",
      dropcap: "MdcDropcap",
      field: "MdcField",
      "field-group": "MdcFieldGroup",
      figure: "MdcFigure",
      layout: "MdcLayout",
      passage: "MdcPassage",
      quiz: "MdcQuiz",
      "quiz-option": "MdcQuizOption",
      "quiz-question": "MdcQuizQuestion",
      "read-more": "MdcReadMore",
      "read-more-group": "MdcReadMoreGroup",
      shortcut: "MdcShortcut",
      step: "MdcStep",
      steps: "MdcSteps",
      tab: "MdcTab",
      tabs: "MdcTabs",
      timeline: "MdcTimeline",
      "timeline-item": "MdcTimelineItem",
    });
    expect(nuxtConfig).toContain('"code-group": "MdcCodeGroup"');
    expect(nuxtConfig).not.toContain('"consent-embed":');
    expect(nuxtConfig).not.toContain("gallery:");
  });

  it("flattens nested toc links for the existing TOC component", () => {
    expect(
      flattenTocLinks([
        {
          id: "overview",
          text: "Overview",
          depth: 2,
          children: [{ id: "details", text: "Details", depth: 3 }],
        },
      ]),
    ).toEqual([
      { id: "overview", label: "Overview", depth: 2 },
      { id: "details", label: "Details", depth: 3 },
    ]);
  });

  it("keeps the shared document TOC server-renderable from content metadata", () => {
    const shell = readFileSync(
      join(process.cwd(), "app/components/content/DocumentPageShell.vue"),
      "utf8",
    );
    const legalPage = readFileSync(join(process.cwd(), "app/pages/[...slug].vue"), "utf8");
    const docsPage = readFileSync(
      join(process.cwd(), "app/features/docs/components/DocsPageContent.vue"),
      "utf8",
    );

    expect(shell).toContain("tocItems?: FlatTocItem[]");
    expect(shell).not.toContain("ClientOnly");
    expect(shell).not.toContain("onMounted");
    expect(shell).not.toContain('querySelectorAll("h2[id]")');

    expect(legalPage).toContain("flattenTocLinks(page.value?.body?.toc?.links)");
    expect(legalPage).toContain(':toc-items="tocItems"');
    expect(legalPage).not.toContain(":show-toc");

    expect(docsPage).toContain('class="content-prose content-prose-docs"');
  });

  it("keeps public search scoped to routable content collections", () => {
    const nuxtConfig = readFileSync(join(process.cwd(), "nuxt.config.ts"), "utf8");
    const commandCenter = readFileSync(
      join(process.cwd(), "app/features/search/useCommandCenter.ts"),
      "utf8",
    );

    expect(nuxtConfig).toContain('collections: ["docs", "blog"]');
    expect(nuxtConfig).not.toContain('collections: ["docs", "blog", "authors"]');
    expect(nuxtConfig).not.toContain("testimonials");
    expect(nuxtConfig).not.toContain("faqs");
    expect(commandCenter).toContain("useSiteNavigation");
    expect(commandCenter).toContain("mainNav.value.map");
    expect(commandCenter).toContain("footerNav.value");
    expect(commandCenter).not.toContain('id: "page-services"');
    expect(commandCenter).not.toContain('id: "page-references"');
    expect(commandCenter).not.toContain('id: "page-contact"');
  });

  it("keeps sitemap and prerender routes out of app-owned localized route tables", () => {
    const nuxtConfig = readFileSync(join(process.cwd(), "nuxt.config.ts"), "utf8");
    const i18nRoutes = readFileSync(join(process.cwd(), "i18n/routes.ts"), "utf8");

    expect(nuxtConfig).not.toContain("staticRoutes");
    expect(nuxtConfig).not.toMatch(/sitemap:\s*{[\s\S]*?urls:/);
    expect(nuxtConfig).toContain('customRoutes: "config"');
    expect(nuxtConfig).toContain("pages: i18nPages");
    expect(nuxtConfig).not.toContain('"/dokumentation": { prerender: true }');
    expect(nuxtConfig).not.toContain('"/de/dokumentation": { prerender: true }');
    expect(nuxtConfig).not.toContain('"/blog": { prerender: true }');
    expect(nuxtConfig).not.toContain('"/de/blog": { prerender: true }');
    expect(nuxtConfig).not.toContain('"/dokumentation",');
    expect(nuxtConfig).not.toContain('"/de/dokumentation",');
    expect(nuxtConfig).not.toContain('"/blog",');
    expect(nuxtConfig).not.toContain('"/de/blog",');
    expect(nuxtConfig).not.toContain("/preise");
    expect(nuxtConfig).not.toContain("/de/preise");
    expect(nuxtConfig).not.toContain("/datenschutz");
    expect(nuxtConfig).not.toContain("/de/datenschutz");
    expect(i18nRoutes).not.toContain('pricing: "/preise"');
    expect(i18nRoutes).not.toContain('pricing: "/pricing"');
    expect(i18nRoutes).not.toContain("docsSlug");
    expect(i18nRoutes).not.toContain("blogSlug");
    expect(i18nRoutes).not.toContain("servicesSlug");
    expect(i18nRoutes).not.toContain("referencesSlug");
  });

  it("keeps the header locale switch route-aware and Ginko-backed for content", () => {
    const siteHeader = readFileSync(
      join(process.cwd(), "app/components/site/SiteHeader.vue"),
      "utf8",
    );
    const localeSwitcher = readFileSync(
      join(process.cwd(), "app/components/site/SiteLocaleSwitcher.vue"),
      "utf8",
    );
    const routeSwitch = readFileSync(
      join(process.cwd(), "app/composables/useLocalizedRouteSwitch.ts"),
      "utf8",
    );

    expect(siteHeader).toContain("<SiteLocaleSwitcher");
    expect(localeSwitcher).toContain("useLocalizedRouteSwitch()");
    expect(localeSwitcher).toContain("to: switchPath(normalized.code)");
    expect(routeSwitch).toContain("useContentSwitchLocalePath()");
    expect(routeSwitch).toContain("useSwitchLocalePath()");
    expect(routeSwitch).not.toContain("useContentOne");
    expect(routeSwitch).not.toContain("useContentVariants");
    expect(routeSwitch).not.toContain("async function");
    expect(routeSwitch).not.toContain("/dokumentation/essentials");
    expect(localeSwitcher).not.toContain("useContentLocaleSwitch");
    expect(localeSwitcher).not.toContain("switchDocsLocale");
    expect(localeSwitcher).not.toContain("switchBlogLocale");
    expect(localeSwitcher).not.toMatch(/from\s+["'].*content\.config["']/);
    expect(localeSwitcher).not.toContain('"/docs"');
    expect(localeSwitcher).toContain(":hreflang=");
    expect(localeSwitcher).toContain(":aria-current=");
  });

  it("formats content dates in the active locale", () => {
    const german = formatContentDate("2026-05-14", "de");
    const english = formatContentDate("2026-05-14", "en");

    expect(german).toContain("2026");
    expect(english).toContain("2026");
    expect(german).not.toBe(english);
  });

  it("authors internal content links as locale-resolving refs", () => {
    const germanDocs = readContentFiles("de/1.dokumentation", ".md")
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    const englishDocs = readContentFiles("en/1.docs", ".md")
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(germanDocs).toContain("$docs/");
    expect(germanDocs).toContain("$main.");
    expect(germanDocs).not.toMatch(/\]\(\/(?:de\/)?dokumentation/);
    expect(germanDocs).not.toMatch(/\bto="\/(?:de\/)?dokumentation/);
    expect(englishDocs).toContain("$docs/");
    expect(englishDocs).toContain("$main.");
    expect(englishDocs).not.toMatch(/\]\(\/(?:en\/)?docs/);
    expect(englishDocs).not.toMatch(/\bto="\/(?:en\/)?docs/);
  });
});
