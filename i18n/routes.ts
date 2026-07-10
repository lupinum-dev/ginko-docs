import { type LocaleCode, localeCodes } from "./locales";

export const localizedRoutes = {
  en: {
    home: "/",
    docs: "/docs",
    blog: "/blog",
    privacy: "/privacy",
    terms: "/terms",
    imprint: "/imprint",
  },
  de: {
    home: "/",
    docs: "/dokumentation",
    blog: "/blog",
    privacy: "/datenschutz",
    terms: "/agb",
    imprint: "/impressum",
  },
} as const satisfies Record<LocaleCode, Record<string, string>>;

export type LocalizedRouteKey = keyof (typeof localizedRoutes)[LocaleCode];

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
};
