import { localeCodes, localizedPath } from "../../i18n/locales";
import { routeSlugs } from "../../shared/route-slugs";

interface SitemapAlternative {
  href: string;
}

export interface SitemapEntry {
  loc: string;
  alternatives?: SitemapAlternative[];
}

interface SitemapContentPolicy {
  locales: readonly string[];
  blogEnabled: boolean;
}

const pathname = (url: string) => new URL(url, "https://ginko.invalid").pathname;

export function filterSitemapEntries<Entry extends SitemapEntry>(
  entries: Entry[],
  policy: SitemapContentPolicy,
): Entry[] {
  const disabledLocaleRoots = localeCodes
    .filter((locale) => !policy.locales.includes(locale))
    .map((locale) => `/${locale}`);
  const disabledBlogRoots = policy.blogEnabled
    ? []
    : localeCodes.map((locale) => localizedPath(locale, routeSlugs.blog[locale]));
  const excludedRoots = [...disabledLocaleRoots, ...disabledBlogRoots];
  const isExcluded = (url: string) => {
    const path = pathname(url);
    return excludedRoots.some((root) => path === root || path.startsWith(`${root}/`));
  };

  return entries
    .filter((entry) => !isExcluded(entry.loc))
    .map((entry) => {
      if (!entry.alternatives) return entry;
      return {
        ...entry,
        alternatives: entry.alternatives.filter((alternative) => !isExcluded(alternative.href)),
      };
    });
}
