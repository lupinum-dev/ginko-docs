import { defineNitroPlugin } from "nitropack/runtime";
import { siteConfig } from "../../app/site.config";

type SitemapAlternative = {
  href?: string | URL;
};

type SitemapUrl = {
  loc?: string | URL;
  alternatives?: SitemapAlternative[];
};

type SitemapOutput = {
  sitemap: string;
};

function isLocalOrigin(url: URL) {
  return url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "::1";
}

function normalizeUrl(value: string | URL | undefined, siteUrl: URL) {
  if (!value) return value;

  const raw = value instanceof URL ? value.href : value;

  try {
    const url = new URL(raw, siteUrl);
    if (!isLocalOrigin(url)) return raw;
    return new URL(`${url.pathname}${url.search}${url.hash}`, siteUrl).href;
  } catch {
    return raw;
  }
}

export default defineNitroPlugin((nitro) => {
  (nitro.hooks.hook as (name: string, callback: (ctx: { urls: SitemapUrl[] }) => void) => void)(
    "sitemap:resolved",
    (ctx) => {
      const siteUrl = new URL(siteConfig.site.url);
      for (const url of ctx.urls) {
        url.loc = normalizeUrl(url.loc, siteUrl);
        for (const alternative of url.alternatives ?? []) {
          alternative.href = normalizeUrl(alternative.href, siteUrl);
        }
      }
    },
  );

  (nitro.hooks.hook as (name: string, callback: (ctx: SitemapOutput) => void) => void)(
    "sitemap:output",
    (ctx) => {
      const siteUrl = new URL(siteConfig.site.url);
      ctx.sitemap = ctx.sitemap.replace(
        /https?:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?/g,
        siteUrl.origin,
      );
    },
  );
});
