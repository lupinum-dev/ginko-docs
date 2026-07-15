import { localeCodes, localizedPath } from "../../../i18n/locales";
import { localizedRoutes } from "../../../i18n/routes";

export type RawDocsTreeItem = {
  title?: string;
  path?: string;
  icon?: string;
  badge?: string;
  sidebar?: "section" | "group";
  children?: RawDocsTreeItem[];
};

export type DocsNavigationItem = {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  badge?: string;
  sidebar?: "section" | "group";
  children: DocsNavigationItem[];
};

export type DocsNavigationSection = {
  id: string;
  title?: string;
  path?: string;
  icon?: string;
  items: DocsNavigationItem[];
};

export type DocsNavigationGroup = {
  id: string;
  title?: string;
  icon?: string;
  items: DocsNavigationItem[];
};

function itemId(item: RawDocsTreeItem): string {
  return item.path ?? item.title ?? "docs-item";
}

export function normalizeDocsNavigationItem(item: RawDocsTreeItem): DocsNavigationItem {
  return {
    id: itemId(item),
    title: item.title ?? "Untitled",
    path: item.path,
    icon: item.icon,
    badge: item.badge,
    sidebar: item.sidebar,
    children: (item.children ?? []).map(normalizeDocsNavigationItem),
  };
}

export function normalizeDocsNavigationPath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/**
 * Depth-first search for the first navigable page in the docs tree. Structural
 * sections and groups have no `path` of their own, so the entry page can sit
 * one or more levels deep.
 */
export function firstDocsNavigationPath(items: RawDocsTreeItem[] | undefined): string | undefined {
  for (const item of items ?? []) {
    if (item.path) return item.path;
    const nested = firstDocsNavigationPath(item.children);
    if (nested) return nested;
  }
  return undefined;
}

export function isDocsNavigationRoot(item: DocsNavigationItem): boolean {
  const docsRoots = new Set(
    localeCodes.flatMap((locale) => [
      localizedRoutes[locale].docs,
      localizedPath(locale, localizedRoutes[locale].docs),
    ]),
  );
  return docsRoots.has(item.path ?? "") || docsRoots.has(item.id) || item.id === "docs";
}

export function docsNavigationItemContainsPath(item: DocsNavigationItem, path: string): boolean {
  const normalizedPath = normalizeDocsNavigationPath(path);
  return (
    (item.path !== undefined && normalizeDocsNavigationPath(item.path) === normalizedPath) ||
    item.children.some((child) => docsNavigationItemContainsPath(child, normalizedPath))
  );
}

export function docsNavigationSectionContainsPath(
  section: DocsNavigationSection,
  path: string,
): boolean {
  const normalizedPath = normalizeDocsNavigationPath(path);
  return (
    (section.path !== undefined && normalizeDocsNavigationPath(section.path) === normalizedPath) ||
    section.items.some((item) => docsNavigationItemContainsPath(item, normalizedPath))
  );
}

export function findDocsNavigationTrail(
  items: DocsNavigationItem[],
  path: string,
): DocsNavigationItem[] {
  const normalizedPath = normalizeDocsNavigationPath(path);
  for (const item of items) {
    if (item.path && normalizeDocsNavigationPath(item.path) === normalizedPath) return [item];
    const descendants = findDocsNavigationTrail(item.children, normalizedPath);
    if (descendants.length > 0) return [item, ...descendants];
  }
  return [];
}

export function getDocsNavigationSections(items: DocsNavigationItem[]): DocsNavigationSection[] {
  if (!items.some((item) => item.sidebar === "section")) {
    return [{ id: "docs:main", items: [...items] }];
  }

  const sections: DocsNavigationSection[] = [];
  let current: DocsNavigationSection | undefined;

  for (const item of items) {
    if (item.sidebar === "section") {
      current = {
        id: item.id,
        title: item.title,
        path: item.path,
        icon: item.icon,
        items: [...item.children],
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = { id: "docs:main", items: [] };
      sections.push(current);
    }
    current.items.push(item);
  }

  return sections;
}

export function getDocsNavigationGroups(section: DocsNavigationSection): DocsNavigationGroup[] {
  const groups: DocsNavigationGroup[] = [];
  const ungrouped: DocsNavigationItem[] = [];

  if (section.path) {
    ungrouped.push({
      id: section.id,
      title: section.title ?? "Overview",
      path: section.path,
      icon: section.icon,
      children: [],
    });
  }

  for (const child of section.items) {
    if (child.sidebar !== "group") {
      ungrouped.push(child);
      continue;
    }

    const items = child.path
      ? [
          {
            ...child,
            children: [],
          },
          ...child.children,
        ]
      : child.children;

    groups.push({
      id: child.id,
      title: child.title,
      icon: child.icon,
      items,
    });
  }

  if (ungrouped.length) {
    groups.unshift({
      id: `${section.id}:main`,
      items: ungrouped,
    });
  }

  return groups.filter((group) => group.items.length > 0);
}
