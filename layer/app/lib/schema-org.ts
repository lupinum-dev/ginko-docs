import { siteConfig } from "../site.config";
import type { LocaleCode, SiteConfig } from "../config/site.schema";
import { getLocalizedSiteText, resolveSiteUrl } from "../config/site.utils";

function absoluteUrl(path: string, config: SiteConfig) {
  return new URL(path, resolveSiteUrl(config.site.url)).toString();
}

export function createWebSiteSchema(
  locale: LocaleCode = siteConfig.site.defaultLocale,
  config: SiteConfig = siteConfig,
) {
  return {
    "@type": "WebSite",
    name: getLocalizedSiteText(config.site.name, locale),
    description: getLocalizedSiteText(config.site.description, locale),
    url: resolveSiteUrl(config.site.url),
    inLanguage: locale,
  };
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
  config: SiteConfig = siteConfig,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, config),
    })),
  };
}

export function createArticleSchema(
  article: { date: string; description: string; title: string },
  url: string,
  authorName: string,
  locale: LocaleCode = siteConfig.site.defaultLocale,
) {
  return {
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    url,
    inLanguage: locale,
    author: authorName ? { name: authorName } : undefined,
  };
}
