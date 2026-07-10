import { type LocaleCode, localeCodes } from "./locales";

export const localizedRoutes = {
  en: {
    home: "/",
    docs: "/docs",
    blog: "/blog",
    services: "/services",
    references: "/references",
    features: "/#features",
    contact: "/contact",
    "thank-you": "/thank-you",
    about: "/about",
    privacy: "/privacy",
    terms: "/terms",
    imprint: "/imprint",
    websiteClarity: "/website-clarity-call",
  },
  de: {
    home: "/",
    docs: "/dokumentation",
    blog: "/blog",
    services: "/leistungen",
    references: "/referenzen",
    features: "/#features",
    contact: "/kontakt",
    "thank-you": "/danke",
    about: "/ueber-uns",
    privacy: "/datenschutz",
    terms: "/agb",
    imprint: "/impressum",
    websiteClarity: "/website-klarheitsgespraech",
  },
} as const satisfies Record<LocaleCode, Record<string, string>>;

export type LocalizedRouteKey = keyof (typeof localizedRoutes)[LocaleCode];

const staticPageRouteKeys = ["contact", "thank-you", "about"] as const;

const catchAllPage = <const T extends string>(route: T): `${T}/[...slug]` => `${route}/[...slug]`;
const singleSlugPage = <const T extends string>(route: T): `${T}/[slug]` => `${route}/[slug]`;
const routeMap = <T>(getRoute: (locale: LocaleCode) => T): Record<LocaleCode, T> =>
  Object.fromEntries(localeCodes.map((locale) => [locale, getRoute(locale)])) as Record<
    LocaleCode,
    T
  >;

export const i18nPages = {
  index: routeMap((locale) => localizedRoutes[locale].home),
  "docs-slug": routeMap((locale) => catchAllPage(localizedRoutes[locale].docs)),
  blog: routeMap((locale) => localizedRoutes[locale].blog),
  "blog-slug": routeMap((locale) => singleSlugPage(localizedRoutes[locale].blog)),
  services: routeMap((locale) => localizedRoutes[locale].services),
  "services-slug": routeMap((locale) => catchAllPage(localizedRoutes[locale].services)),
  references: routeMap((locale) => localizedRoutes[locale].references),
  "references-slug": routeMap((locale) => catchAllPage(localizedRoutes[locale].references)),
  "campaigns-website-clarity": routeMap((locale) => localizedRoutes[locale].websiteClarity),
  ...Object.fromEntries(
    staticPageRouteKeys.map((key) => [key, routeMap((locale) => localizedRoutes[locale][key])]),
  ),
};
