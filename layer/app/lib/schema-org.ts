import type { LocaleCode } from "../../i18n/locales";

function absoluteUrl(path: string, siteUrl: string) {
  return new URL(path, siteUrl).toString();
}

export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
  siteUrl: string,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteUrl),
    })),
  };
}

export function createArticleSchema(
  article: { date: string; description: string; title: string },
  url: string,
  authorName: string,
  locale: LocaleCode,
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
