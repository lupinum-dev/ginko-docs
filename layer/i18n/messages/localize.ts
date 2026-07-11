import type { LocaleCode } from "../locales";
import { localeCodes } from "../locales";

type LocalizedLeaf = Record<LocaleCode, string>;

function isLocalizedLeaf(value: unknown): value is LocalizedLeaf {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === localeCodes.length &&
    localeCodes.every((locale) => typeof (value as Partial<LocalizedLeaf>)[locale] === "string")
  );
}

export function localizeMessages(source: unknown, locale: LocaleCode): any {
  if (isLocalizedLeaf(source)) return source[locale];
  if (Array.isArray(source)) return source.map((item) => localizeMessages(item, locale));
  if (source && typeof source === "object") {
    return Object.fromEntries(
      Object.entries(source).map(([key, value]) => [key, localizeMessages(value, locale)]),
    );
  }
  return source;
}
