import { describe, expect, it } from "vite-plus/test";
import { defineGinkoDocsConfig } from "./content.js";

const site = {
  name: "Example Docs",
  description: "Example documentation.",
  url: "https://docs.example.com",
};

describe("defineGinkoDocsConfig", () => {
  it("builds the supported English-only layout", () => {
    const config = defineGinkoDocsConfig({ site, locales: ["en"] });

    expect(config.collections.docs).toMatchObject({
      source: "docs/**/*.md",
      route: "/docs",
    });
    expect(config.collections.docs.i18n).toBeUndefined();
    expect(config.agent?.pages).toBeUndefined();
  });

  it("builds the supported bilingual layout", () => {
    const config = defineGinkoDocsConfig({
      site: {
        name: { en: "Example Docs", de: "Example Docs" },
        description: { en: "Example documentation.", de: "Beispieldokumentation." },
        url: site.url,
      },
      locales: ["en", "de"],
      blog: true,
    });

    expect(config.collections.docs).toMatchObject({
      source: "{1.docs,1.dokumentation}/**/*.md",
      i18n: true,
      route: { en: "/docs", de: "/dokumentation" },
    });
    expect(config.collections.blog).toMatchObject({
      source: "2.blog/*.md",
      i18n: true,
      route: { en: "/blog", de: "/blog" },
    });
    expect(config.agent?.site).toMatchObject({
      title: { en: "Example Docs", de: "Example Docs" },
      description: { en: "Example documentation.", de: "Beispieldokumentation." },
    });
    expect(config.agent?.pages).toBeUndefined();
  });

  it("adds curated agent sections without duplicating documentation content", () => {
    const render = () => "# Start here\n\n- [Install](/raw/docs/getting-started/installation.md)";
    const config = defineGinkoDocsConfig({
      site,
      agent: {
        documentation: { includeInFull: true, includeInIndex: false },
        pages: [
          {
            id: "start-here",
            route: "/agents/start-here",
            section: "start",
            title: "Start here",
            description: "First Nuxt PDF tasks.",
            render,
          },
        ],
        sections: [{ id: "start", title: "Start here", order: 10 }],
      },
    });

    expect(config.collections.docs.agent).toEqual({
      section: "optional",
      markdown: { includeInFull: true, includeInIndex: false },
    });
    expect(config.agent?.sections?.map((section) => section.id)).toEqual(["start", "optional"]);
    expect(config.agent?.pages).toEqual([expect.objectContaining({ id: "start-here", render })]);
  });

  it.each([
    { locales: [] },
    { locales: ["de"] },
    { locales: ["en", "en"] },
    { locales: ["de", "en"] },
    { locales: ["en", "de", "en"] },
  ])("rejects unsupported locale layout $locales", ({ locales }) => {
    expect(() =>
      defineGinkoDocsConfig({
        site,
        // Exercise the runtime boundary used by JavaScript consumers.
        locales,
      } as never),
    ).toThrow('locales must be exactly ["en"] or ["en", "de"]');
  });
});
