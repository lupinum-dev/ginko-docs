type TocLinkLike = {
  id?: string;
  text?: string;
  label?: string;
  depth?: number;
  children?: TocLinkLike[];
};

export type FlatTocItem = {
  id: string;
  label: string;
  depth?: number;
};

export function normalizeInternalPath(path: string): string {
  const normalized = path.replace(/\/{2,}/g, "/");
  return normalized || "/";
}

export function localeFromRoutePath(path: string): LocaleCode {
  return localeFromPath(normalizeInternalPath(path));
}

export function toRootMountedContentPath(
  routePath: string,
  locale: LocaleCode = defaultLocale,
): string {
  return stripLocalePrefix(normalizeInternalPath(routePath), locale);
}

export function formatContentDate(
  value?: string | Date | null,
  locale: string = defaultLocale,
): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function flattenTocLinks(links?: TocLinkLike[] | null): FlatTocItem[] {
  const output: FlatTocItem[] = [];

  function visit(items: TocLinkLike[] | undefined) {
    for (const item of items ?? []) {
      const label = item.text ?? item.label;
      if (item.id && label) {
        output.push({
          id: item.id,
          label,
          depth: item.depth,
        });
      }

      visit(item.children);
    }
  }

  visit(links ?? undefined);
  return output;
}
import type { LocaleCode } from "../../i18n/locales";
import { defaultLocale, localeFromPath, stripLocalePrefix } from "../../i18n/locales";
