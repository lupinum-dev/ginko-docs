import type { LocaleCode } from "../locales";
import { localeCodes } from "../locales";

type LocalizedLeaf = Record<LocaleCode, string>;

export type LocalizedMessages<T> = T extends LocalizedLeaf
  ? string
  : T extends readonly (infer TItem)[]
    ? LocalizedMessages<TItem>[]
    : T extends object
      ? { [TKey in keyof T]: LocalizedMessages<T[TKey]> }
      : T;

function isLocalizedLeaf(value: unknown): value is LocalizedLeaf {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === localeCodes.length &&
    localeCodes.every((locale) => typeof (value as Partial<LocalizedLeaf>)[locale] === "string")
  );
}

export function localizeMessages<T>(source: T, locale: LocaleCode): LocalizedMessages<T> {
  if (isLocalizedLeaf(source)) return source[locale] as LocalizedMessages<T>;
  if (Array.isArray(source)) {
    return source.map((item) => localizeMessages(item, locale)) as LocalizedMessages<T>;
  }
  if (source && typeof source === "object") {
    return Object.fromEntries(
      Object.entries(source).map(([key, value]) => [key, localizeMessages(value, locale)]),
    ) as LocalizedMessages<T>;
  }
  return source as LocalizedMessages<T>;
}
