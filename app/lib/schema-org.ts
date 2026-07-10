import { siteConfig } from "../site.config";
import type { LocaleCode, SiteConfig } from "../config/site.schema";
import { getLocalizedSiteText, resolveSiteUrl } from "../config/site.utils";

function absoluteUrl(path: string, config: SiteConfig) {
  return new URL(path, resolveSiteUrl(config.site.url)).toString();
}

function sameAs(config: SiteConfig) {
  return Object.values(config.social).filter((url): url is string => Boolean(url));
}

function address(config: SiteConfig) {
  const { address } = config.contact;

  return {
    streetAddress: address.street,
    postalCode: address.postalCode,
    addressLocality: address.city,
    addressCountry: address.countryCode,
  };
}

function commonIdentity(config: SiteConfig, locale: LocaleCode) {
  return {
    name: config.identity.brandName,
    legalName: config.identity.legalName,
    description: getLocalizedSiteText(config.site.description, locale),
    url: resolveSiteUrl(config.site.url),
    logo: absoluteUrl(config.site.logo.light, config),
    email: config.contact.email,
    telephone: config.contact.phone,
    address: address(config),
    sameAs: sameAs(config),
    vatID: config.identity.vatId,
    foundingDate: config.identity.foundingYear?.toString(),
    areaServed: config.schema.areaServed,
  };
}

export function createBusinessIdentitySchema(
  locale: LocaleCode = siteConfig.site.defaultLocale,
  config: SiteConfig = siteConfig,
) {
  const identity = commonIdentity(config, locale);

  return {
    "@type": config.schema.type,
    ...identity,
  };
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

export function createServiceSchema(
  service: { description: string; outcome?: string; title: string },
  url: string,
  locale: LocaleCode = siteConfig.site.defaultLocale,
  config: SiteConfig = siteConfig,
) {
  return {
    "@type": "Service",
    name: service.title,
    description: service.description,
    url,
    serviceType: service.title,
    areaServed: config.schema.areaServed,
    provider: createBusinessIdentitySchema(locale, config),
  };
}

export function createArticleSchema(
  article: { date: string; description: string; title: string },
  url: string,
  authorName: string,
  locale: LocaleCode = siteConfig.site.defaultLocale,
  config: SiteConfig = siteConfig,
) {
  return {
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    url,
    inLanguage: locale,
    author: authorName ? { name: authorName } : undefined,
    publisher: createBusinessIdentitySchema(locale, config),
  };
}

export function createFaqSchema(items: Array<{ answer: string; question: string }>) {
  return items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  }));
}
