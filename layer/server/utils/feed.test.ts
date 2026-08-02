import { describe, expect, it } from "vite-plus/test";
import { buildRssFeed } from "./feed";

const site = {
  title: "Ginko Docs Blog",
  description: "Updates, guides, and technical insights.",
  siteUrl: "https://docs.example.com",
  feedPath: "/blog/rss.xml",
  language: "en-US",
};

describe("buildRssFeed", () => {
  it("renders a channel with absolute links and RFC 822 dates", () => {
    const xml = buildRssFeed({
      ...site,
      items: [
        {
          title: "Second post",
          path: "/blog/second",
          description: "Newer entry.",
          date: "2026-06-02",
          authorName: "Ada",
        },
        {
          title: "First post",
          path: "/blog/first",
          description: "Older entry.",
          date: "2026-05-14",
        },
      ],
    });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<title>Ginko Docs Blog</title>");
    expect(xml).toContain("<link>https://docs.example.com/blog/</link>");
    expect(xml).toContain(
      '<atom:link href="https://docs.example.com/blog/rss.xml" rel="self" type="application/rss+xml"/>',
    );
    expect(xml).toContain("<guid>https://docs.example.com/blog/second</guid>");
    expect(xml).toContain("<pubDate>Tue, 02 Jun 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<lastBuildDate>Tue, 02 Jun 2026 00:00:00 GMT</lastBuildDate>");
    expect(xml).toContain("<dc:creator>Ada</dc:creator>");
    expect(xml).toContain("<language>en-US</language>");
  });

  it("escapes markup in authored text", () => {
    const xml = buildRssFeed({
      ...site,
      items: [
        {
          title: 'Ampersands & <angles> in "titles"',
          path: "/blog/escapes?a=1&b=2",
          description: "Uses <code> & entities.",
          date: "2026-01-01",
        },
      ],
    });

    expect(xml).toContain("Ampersands &amp; &lt;angles&gt; in &quot;titles&quot;");
    expect(xml).toContain("<link>https://docs.example.com/blog/escapes?a=1&amp;b=2</link>");
    expect(xml).toContain("Uses &lt;code&gt; &amp; entities.");
    expect(xml).not.toContain("<code>");
  });

  it("omits lastBuildDate and items for an empty blog", () => {
    const xml = buildRssFeed({ ...site, items: [] });

    expect(xml).not.toContain("lastBuildDate");
    expect(xml).not.toContain("<item>");
    expect(xml).toContain("<description>Updates, guides, and technical insights.</description>");
  });
});
