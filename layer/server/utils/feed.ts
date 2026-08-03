export interface RssFeedItem {
  title: string;
  /** Site-relative path of the post, e.g. "/blog/my-post". */
  path: string;
  description: string;
  /** Authored publication date, YYYY-MM-DD. */
  date: string;
  authorName?: string;
}

export interface RssFeedInput {
  title: string;
  description: string;
  /** Absolute site origin, e.g. "https://docs.example.com". */
  siteUrl: string;
  /** Site-relative path of the feed itself, e.g. "/blog/rss.xml". */
  feedPath: string;
  language: string;
  items: RssFeedItem[];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function buildRssFeed(feed: RssFeedInput): string {
  const base = feed.siteUrl.replace(/\/$/, "");
  const newestDate = feed.items
    .map((item) => item.date)
    .sort()
    .at(-1);

  const items = feed.items
    .map((item) => {
      const link = `${base}${item.path}`;
      const author = item.authorName
        ? `\n      <dc:creator>${escapeXml(item.authorName)}</dc:creator>`
        : "";
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${toRfc822(item.date)}</pubDate>
      <description>${escapeXml(item.description)}</description>${author}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(`${base}${feed.feedPath.replace(/rss\.xml$/, "")}`)}</link>
    <atom:link href="${escapeXml(`${base}${feed.feedPath}`)}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(feed.description)}</description>
    <language>${escapeXml(feed.language)}</language>${newestDate ? `\n    <lastBuildDate>${toRfc822(newestDate)}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;
}
