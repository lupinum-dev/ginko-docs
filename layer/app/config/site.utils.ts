import type { LocaleCode, LocalizedText } from "./site.schema";
import { defaultLocale } from "../../i18n/locales";

export function getLocalizedSiteText(
  value: LocalizedText,
  locale: string,
  fallbackLocale: LocaleCode = defaultLocale,
): string {
  if (typeof value === "string") return value;
  return value[locale as LocaleCode] ?? value[fallbackLocale] ?? Object.values(value)[0] ?? "";
}

function isLocalSiteUrl(value: string) {
  try {
    const host = new URL(value).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

export function resolveSiteUrl(
  canonicalUrl: string,
  options: {
    envUrl?: string;
    mode?: string;
  } = {},
) {
  const { envUrl, mode } = options;

  if (!envUrl) return canonicalUrl;
  if (isLocalSiteUrl(envUrl) && mode !== "development" && mode !== "test") {
    return canonicalUrl;
  }
  return envUrl;
}
