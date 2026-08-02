import { localeCodes, localizedPath } from "../../i18n/locales";
import { routeSlugs } from "../../shared/route-slugs";

export interface RedirectSourceDocument {
  route: { resolvedPath: string };
  redirectFrom?: string[];
}

export function normalizeRedirectPath(path: string): string {
  const trimmed = path.split("?")[0] ?? path;
  if (trimmed === "/") return "/";
  return trimmed.replace(/\/+$/, "");
}

/** Routes the theme itself owns; a redirect must never shadow one of them. */
export function themeStaticRoutes(): string[] {
  return localeCodes.flatMap((locale) => [
    localizedPath(locale, routeSlugs.home[locale]),
    localizedPath(locale, routeSlugs.docs[locale]),
    localizedPath(locale, routeSlugs.blog[locale]),
  ]);
}

/**
 * Builds old-path → live-path pairs from every document's `redirectFrom`.
 * Conflicts throw so `failOnError` stops the build instead of shipping a
 * redirect that shadows a live page.
 */
export function buildRedirectMap(documents: RedirectSourceDocument[]): Map<string, string> {
  const livePaths = new Set(
    documents.map((document) => normalizeRedirectPath(document.route.resolvedPath)),
  );
  const reserved = new Set(themeStaticRoutes().map(normalizeRedirectPath));
  const map = new Map<string, string>();
  const problems: string[] = [];

  for (const document of documents) {
    const target = normalizeRedirectPath(document.route.resolvedPath);
    for (const source of document.redirectFrom ?? []) {
      const from = normalizeRedirectPath(source);
      if (livePaths.has(from)) {
        problems.push(`"${from}" redirects to "${target}" but is also a live page`);
      } else if (reserved.has(from)) {
        problems.push(`"${from}" redirects to "${target}" but is a theme route`);
      } else if (map.has(from) && map.get(from) !== target) {
        problems.push(`"${from}" is claimed by both "${map.get(from)}" and "${target}"`);
      } else {
        map.set(from, target);
      }
    }
  }

  if (problems.length) {
    throw new Error(`Invalid redirectFrom entries:\n${problems.map((p) => `- ${p}`).join("\n")}`);
  }

  return map;
}
