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

  it("treats German as the unprefixed locale when configured", () => {
    const germanEntries = [
      { loc: "https://docs.example.com/" },
      { loc: "https://docs.example.com/dokumentation/einstieg" },
      { loc: "https://docs.example.com/blog" },
      { loc: "https://docs.example.com/en/docs/getting-started" },
      { loc: "https://docs.example.com/en/blog" },
    ];

    expect(
      filterSitemapEntries(germanEntries, {
        locales: ["de"],
        blogEnabled: false,
        primaryLocale: "de",
      }).map((entry) => entry.loc),
    ).toEqual(["https://docs.example.com/", "https://docs.example.com/dokumentation/einstieg"]);
  });

  it("keeps configured routes when the requested primary locale is inactive", () => {
    const mismatchedEntries = [
      { loc: "https://docs.example.com/" },
      { loc: "https://docs.example.com/docs/getting-started" },
      { loc: "https://docs.example.com/de" },
      { loc: "https://docs.example.com/de/dokumentation/einstieg" },
    ];

    expect(
      filterSitemapEntries(mismatchedEntries, {
        locales: ["en"],
        blogEnabled: true,
        primaryLocale: "de",
      }).map((entry) => entry.loc),
    ).toEqual(["https://docs.example.com/", "https://docs.example.com/docs/getting-started"]);
  });
});
