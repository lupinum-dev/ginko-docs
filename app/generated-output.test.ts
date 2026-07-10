import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { siteConfig } from "./site.config";

const publicRoot = join(process.cwd(), ".output/public");
const deSitemapPath = join(publicRoot, "__sitemap__/de-DE.xml");
const enSitemapPath = join(publicRoot, "__sitemap__/en-US.xml");

const describeGenerated =
  existsSync(deSitemapPath) && existsSync(enSitemapPath) ? describe : describe.skip;

function readGeneratedFile(path: string) {
  return readFileSync(join(publicRoot, path), "utf8");
}

function generatedFileExists(path: string) {
  return existsSync(join(publicRoot, path));
}

function normalizePath(path: string) {
  if (path === "/") return "/";
  return path.replace(/\/$/, "");
}

function urlPath(value: string) {
  return normalizePath(new URL(value).pathname);
}

function htmlPath(path: string) {
  const normalized = normalizePath(path);
  return normalized === "/" ? "index.html" : `${normalized.slice(1)}/index.html`;
}

function readGeneratedHtml(path: string) {
  return readGeneratedFile(htmlPath(path));
}

function schemaGraph(path: string) {
  const html = readGeneratedHtml(path);
  const matches = html.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*data-schema-org="true"[^>]*>([\s\S]*?)<\/script>/g,
  );
  const graph = [...matches].flatMap((match) => {
    const json = JSON.parse(match[1] ?? "{}") as {
      "@graph"?: Array<Record<string, unknown>>;
    };

    return json["@graph"] ?? [];
  });

  expect(graph.length, `${path} schema JSON-LD`).toBeGreaterThan(0);

  return graph;
}

function graphTypes(graph: Array<Record<string, unknown>>) {
  return graph.flatMap((node) => {
    const type = node["@type"];
    return Array.isArray(type) ? type : [type];
  });
}

function sitemapBlocks(xml: string) {
  return [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((match) => match[0]);
}

function blockLocPath(block: string) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  return loc ? urlPath(loc) : "";
}

function blockHrefPaths(block: string) {
  return [...block.matchAll(/\shref="([^"]+)"/g)].map((match) => urlPath(match[1] ?? ""));
}

describeGenerated("generated static output", () => {
  const sitemapXml = () =>
    `${readGeneratedFile("__sitemap__/de-DE.xml")}\n${readGeneratedFile("__sitemap__/en-US.xml")}`;
  const blocks = () => sitemapBlocks(sitemapXml());
  const locPaths = () => blocks().map(blockLocPath).sort();

  function findSitemapBlock(path: string) {
    return blocks().find((block) => blockLocPath(block) === normalizePath(path)) ?? "";
  }

  it("includes static i18n and Ginko content routes in the generated sitemap", () => {
    const paths = locPaths();

    for (const path of [
      "/",
      "/en",
      "/datenschutz",
      "/en/privacy",
      "/ueber-uns",
      "/en/about",
      "/dokumentation/erste-schritte",
      "/en/docs/getting-started",
      "/blog/prerender-seo-suche",
      "/en/blog/prerender-seo-search",
      "/leistungen",
      "/en/services",
      "/leistungen/website-strategie",
      "/en/services/website-strategy",
      "/leistungen/umsetzung",
      "/en/services/implementation",
      "/referenzen",
      "/en/references",
    ]) {
      expect(paths).toContain(path);
    }

    for (const path of [
      "/en/datenschutz",
      "/en/agb",
      "/en/impressum",
      "/thank-you",
      "/danke",
      "/docs",
      "/dokumentation",
      "/services/umsetzung",
      "/leistungen/implementation",
      "/website-klarheitsgespraech",
      "/en/website-clarity-call",
    ]) {
      expect(paths).not.toContain(path);
    }
  });

  it("includes translated alternates for content-backed routes", () => {
    expect(blockHrefPaths(findSitemapBlock("/leistungen/website-strategie"))).toContain(
      "/en/services/website-strategy",
    );
    expect(blockHrefPaths(findSitemapBlock("/en/services/website-strategy"))).toContain(
      "/leistungen/website-strategie",
    );
    expect(blockHrefPaths(findSitemapBlock("/datenschutz"))).toContain("/en/privacy");
    expect(blockHrefPaths(findSitemapBlock("/en/privacy"))).toContain("/datenschutz");
  });

  it("does not leak local origins into generated sitemap URLs", () => {
    const sitemap = sitemapXml();

    expect(sitemap).not.toContain("http://127.0.0.1");
    expect(sitemap).not.toContain("http://localhost");
    expect(sitemap).not.toContain("http://[::1]");
  });

  it("writes generated HTML for localized static and content pages", () => {
    for (const path of [
      "/",
      "/en",
      "/datenschutz",
      "/en/privacy",
      "/leistungen/website-strategie",
      "/en/services/website-strategy",
      "/referenzen",
      "/en/references",
      "/dokumentation/erste-schritte",
      "/en/docs/getting-started",
      "/blog/prerender-seo-suche",
      "/en/blog/prerender-seo-search",
      "/website-klarheitsgespraech",
      "/en/website-clarity-call",
    ]) {
      expect(existsSync(join(publicRoot, htmlPath(path))), path).toBe(true);
    }
  });

  it("does not leak local origins into generated HTML SEO metadata", () => {
    for (const path of [
      "/",
      "/en",
      "/dokumentation/erste-schritte/schnellstart",
      "/en/docs/getting-started/quick-start",
    ]) {
      const html = readGeneratedHtml(path);

      expect(html).not.toContain("http://127.0.0.1");
      expect(html).not.toContain("http://localhost");
      expect(html).not.toContain("http://[::1]");
    }
  });

  it("writes robots and sitemap index files for the generated site", () => {
    const robots = readGeneratedFile("robots.txt");
    const sitemapIndex = readGeneratedFile("sitemap_index.xml");
    const sitemapRedirect = readGeneratedFile("sitemap.xml/index.html");

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("/sitemap_index.xml");
    expect(robots).toContain("Content-Signal: search=yes, ai-input=yes, ai-train=no");
    expect(sitemapIndex).toContain("/__sitemap__/de-DE.xml");
    expect(sitemapIndex).toContain("/__sitemap__/en-US.xml");
    expect(sitemapRedirect).toContain("url=/sitemap_index.xml");
  });

  it("writes generated llms files and canonical raw markdown files", () => {
    const llms = readGeneratedFile("llms.txt");
    const llmsFull = readGeneratedFile("llms-full.txt");
    const enLlms = readGeneratedFile("en/llms.txt");
    const serviceRaw = readGeneratedFile("raw/leistungen/website-strategie.md");
    const enServiceRaw = readGeneratedFile("raw/en/services/website-strategy.md");
    const docsRaw = readGeneratedFile("raw/dokumentation/erste-schritte/schnellstart.md");
    const homeRaw = readGeneratedFile("raw/index.md");
    const enHomeRaw = readGeneratedFile("raw/en.md");
    const contactRaw = readGeneratedFile("raw/kontakt.md");
    const componentDocsRaw = readGeneratedFile(
      "raw/dokumentation/grundlagen/inhalte-rendern/komponenten-tags.md",
    );

    expect(llms).toMatch(/^# Lupinum\n\n> /);
    expect(llms).toContain("## Leistungen");
    expect(enLlms).toContain("## Services");
    expect(llms).toContain("## Dokumentation");
    expect(llms).toContain(`[Lupinum](${siteConfig.site.url}/raw/index.md)`);
    expect(enLlms).toContain(`[Lupinum](${siteConfig.site.url}/raw/en.md)`);
    expect(llms).toContain(
      `[Website-Strategie](${siteConfig.site.url}/raw/leistungen/website-strategie.md)`,
    );
    expect(llms).toContain(
      `[Schnellstart](${siteConfig.site.url}/raw/dokumentation/erste-schritte/schnellstart.md)`,
    );
    expect(llms).not.toContain("/raw/pricing.md");
    expect(llms).not.toContain("/thank-you");
    expect(llmsFull).toContain(`Source: ${siteConfig.site.url}/leistungen/website-strategie`);
    expect(llmsFull).not.toContain(`Source: ${siteConfig.site.url}/pricing`);
    expect(enLlms).toContain(
      `[Website Strategy](${siteConfig.site.url}/raw/en/services/website-strategy.md)`,
    );
    expect(enLlms).not.toContain("/raw/en/pricing.md");

    expect(serviceRaw).toMatch(/^---\ntitle: "Website-Strategie"\n/);
    expect(serviceRaw).toContain(`url: "${siteConfig.site.url}/leistungen/website-strategie"`);
    expect(serviceRaw).toContain('route: "/leistungen/website-strategie"');
    expect(serviceRaw).toContain('locale: "de"');
    expect(serviceRaw).toContain('section: "Leistungen"');
    expect(serviceRaw).toContain('collection: "services"');
    expect(serviceRaw).toContain('source: "ginko-content"');
    expect(serviceRaw).toContain("# Website-Strategie");
    expect(serviceRaw).toContain("## Typische Ergebnisse");
    expect(enServiceRaw).toMatch(/^---\ntitle: "Website Strategy"\n/);
    expect(enServiceRaw).toContain(`url: "${siteConfig.site.url}/en/services/website-strategy"`);
    expect(enServiceRaw).toContain("# Website Strategy");
    expect(enServiceRaw).toContain("## Typical outcomes");
    expect(generatedFileExists("raw/pricing.md")).toBe(false);
    expect(generatedFileExists("raw/de/preise.md")).toBe(false);
    expect(docsRaw).toContain("# Schnellstart");
    expect(docsRaw).toContain('source: "ginko-content"');
    expect(homeRaw).toContain('source: "app-owned"');
    expect(homeRaw).toContain("# Lupinum");
    expect(homeRaw).toContain("Business type:");
    expect(enHomeRaw).toContain('source: "app-owned"');
    expect(enHomeRaw).toContain("# Lupinum");
    expect(contactRaw).toContain('source: "app-owned"');
    expect(contactRaw).toContain("# Kontakt");
    expect(generatedFileExists("en/index.md")).toBe(false);
    expect(generatedFileExists("leistungen/website-strategie/index.md")).toBe(false);
    expect(generatedFileExists("en/services/website-strategy/index.md")).toBe(false);

    for (const tag of ["<callout", "<card", "<tab", "<figure", "<gallery", "<chart>"]) {
      expect(componentDocsRaw).toContain(tag);
    }
    expect(componentDocsRaw).not.toContain("Component omitted:");
  });

  it("writes schema JSON-LD for business identity, pages, and content", () => {
    expect(graphTypes(schemaGraph("/"))).toEqual(
      expect.arrayContaining(["WebSite", siteConfig.schema.type]),
    );

    const serviceGraph = schemaGraph("/leistungen/website-strategie");
    expect(graphTypes(serviceGraph)).toEqual(
      expect.arrayContaining(["WebSite", "BreadcrumbList", "Service"]),
    );
    expect(serviceGraph).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "Service",
          name: "Website-Strategie",
        }),
      ]),
    );

    const blogGraph = schemaGraph("/blog/prerender-seo-suche");
    expect(graphTypes(blogGraph)).toEqual(expect.arrayContaining(["Article", "BreadcrumbList"]));

    const englishHomeGraph = schemaGraph("/en");
    expect(graphTypes(englishHomeGraph)).toEqual(
      expect.arrayContaining(["WebSite", siteConfig.schema.type]),
    );
  });
});
