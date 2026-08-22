import { describe, expect, it } from "vite-plus/test";
import { filterSitemapEntries } from "./sitemap";

const entries = [
  {
    loc: "https://docs.example.com/",
    alternatives: [
      { hreflang: "en-US", href: "https://docs.example.com/" },
      { hreflang: "de-DE", href: "https://docs.example.com/de" },
    ],
  },
  { loc: "https://docs.example.com/blog" },
  { loc: "https://docs.example.com/blog/release" },
  { loc: "https://docs.example.com/de" },
  { loc: "https://docs.example.com/de/blog" },
  { loc: "https://docs.example.com/de/dokumentation" },
  { loc: "https://docs.example.com/docs/getting-started" },
];

describe("sitemap content policy", () => {
  it("removes disabled blog routes and unconfigured locale variants", () => {
    const result = filterSitemapEntries(entries, { locales: ["en"], blogEnabled: false });

    expect(result.map((entry) => entry.loc)).toEqual([
      "https://docs.example.com/",
      "https://docs.example.com/docs/getting-started",
    ]);
    expect(result[0]?.alternatives).toEqual([
      { hreflang: "en-US", href: "https://docs.example.com/" },
    ]);
  });

  it("preserves configured locale and blog routes", () => {
    expect(filterSitemapEntries(entries, { locales: ["en", "de"], blogEnabled: true })).toEqual(
      entries,
    );
  });
});
