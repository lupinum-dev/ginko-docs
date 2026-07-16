export const defaultLocale = "en" as const;

export const locales = [
  {
    code: "en",
    language: "en-US",
    name: "English",
    nativeName: "English",
    shortLabel: "EN",
    flagIcon: "circle-flags:us",
  },
  {
    code: "de",
    language: "de-DE",
    name: "Deutsch",
    nativeName: "Deutsch",
    shortLabel: "DE",
    flagIcon: "circle-flags:de",
  },
] as const;

export type LocaleCode = (typeof locales)[number]["code"];

export const localeCodes = locales.map((locale) => locale.code) as [LocaleCode, ...LocaleCode[]];
export const nonDefaultLocaleCodes = localeCodes.filter((locale) => locale !== defaultLocale);
export const localeIconNames = locales.map((locale) => locale.flagIcon);

export function isLocaleCode(value: string): value is LocaleCode {
  return localeCodes.includes(value as LocaleCode);
}

export function isDefaultLocale(
  locale: LocaleCode,
  primaryLocale: LocaleCode = defaultLocale,
): boolean {
  return locale === primaryLocale;
}

export function localePrefix(
  locale: LocaleCode,
  primaryLocale: LocaleCode = defaultLocale,
): string {
  return isDefaultLocale(locale, primaryLocale) ? "" : `/${locale}`;
}

export function localizedPath(
  locale: LocaleCode,
  path: string,
  primaryLocale: LocaleCode = defaultLocale,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const prefix = localePrefix(locale, primaryLocale);

  if (!prefix) return normalizedPath;
  if (normalizedPath === "/") return prefix;
  if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) return normalizedPath;
  return `${prefix}${normalizedPath}`;
}

export function localeFromPath(
  path: string,
  primaryLocale: LocaleCode = defaultLocale,
  supportedLocales: readonly LocaleCode[] = localeCodes,
): LocaleCode {
  const normalizedPath = path.replace(/\/{2,}/g, "/") || "/";
  const routeLocale = supportedLocales.find(
    (locale) => normalizedPath === `/${locale}` || normalizedPath.startsWith(`/${locale}/`),
  );

  return routeLocale ?? primaryLocale;
}

export function stripLocalePrefix(path: string, locale: LocaleCode): string {
  const normalizedPath = path.replace(/\/{2,}/g, "/") || "/";
  const prefix = `/${locale}`;

  if (isDefaultLocale(locale)) return normalizedPath;
  if (normalizedPath === prefix) return "/";
  if (normalizedPath.startsWith(`${prefix}/`)) return normalizedPath.slice(prefix.length) || "/";
  return normalizedPath;
}
