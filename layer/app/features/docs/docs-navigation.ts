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

export type DocsNavigationSection = DocsNavigationItem;

export type DocsNavigationGroup = {
  id: string;
  title?: string;
  path?: string;
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

function withoutChildren(item: DocsNavigationItem): DocsNavigationItem {
  return {
    ...item,
    children: [],
  };
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
  return (
    item.path === path || item.children.some((child) => docsNavigationItemContainsPath(child, path))
  );
}

export function findDocsNavigationTrail(
  items: DocsNavigationItem[],
  path: string,
): DocsNavigationItem[] {
  for (const item of items) {
    if (item.path === path) return [item];
    const descendants = findDocsNavigationTrail(item.children, path);
    if (descendants.length > 0) return [item, ...descendants];
  }
  return [];
}

export function getDocsNavigationGroups(
  navigationSection?: DocsNavigationSection,
): DocsNavigationGroup[] {
  if (!navigationSection) return [];

  const groups: DocsNavigationGroup[] = [];
  const ungrouped: DocsNavigationItem[] = [];

  if (navigationSection.path) {
    ungrouped.push(withoutChildren(navigationSection));
  }

  for (const child of navigationSection.children) {
    if (child.sidebar !== "group") {
      ungrouped.push(child);
      continue;
    }

    groups.push({
      id: child.id,
      title: child.title,
      path: child.path,
      icon: child.icon,
      items: child.children,
    });
  }

  if (ungrouped.length) {
    groups.unshift({
      id: `${navigationSection.id}:main`,
      items: ungrouped,
    });
  }

  return groups.filter((group) => group.items.length > 0);
}
