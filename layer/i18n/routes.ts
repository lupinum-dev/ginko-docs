import { type LocaleCode, localeCodes } from "./locales";
import { routeSlugs } from "../shared/route-slugs";

export const localizedRoutes = {
  en: {
    home: routeSlugs.home.en,
    docs: routeSlugs.docs.en,
    blog: routeSlugs.blog.en,
  },
  de: {
    home: routeSlugs.home.de,
    docs: routeSlugs.docs.de,
    blog: routeSlugs.blog.de,
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
  docs: routeMap((locale) => localizedRoutes[locale].docs),
  "docs-slug": routeMap((locale) => catchAllPage(localizedRoutes[locale].docs)),
  blog: routeMap((locale) => localizedRoutes[locale].blog),
  "blog-slug": routeMap((locale) => singleSlugPage(localizedRoutes[locale].blog)),
};
