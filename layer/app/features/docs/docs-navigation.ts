import type { ContentNavigationTreeItem } from "@lupinum/ginko-content/client";

export type RawDocsTreeItem = Omit<ContentNavigationTreeItem, "children"> & {
  icon?: unknown;
  badge?: unknown;
  sidebar?: unknown;
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

function itemId(item: RawDocsTreeItem, position: string): string {
  return item.path ?? `docs:${position}:${item.title}`;
}

export function normalizeDocsNavigationItem(
  item: RawDocsTreeItem,
  position: string | number = 0,
): DocsNavigationItem {
  const positionKey = String(position);
  return {
    id: itemId(item, positionKey),
    title: item.title,
    path: item.path,
    icon: typeof item.icon === "string" ? item.icon : undefined,
    badge: typeof item.badge === "string" ? item.badge : undefined,
    sidebar: item.sidebar === "section" || item.sidebar === "group" ? item.sidebar : undefined,
    children: (item.children ?? []).map((child, index) =>
      normalizeDocsNavigationItem(child, `${positionKey}.${index}`),
    ),
  };
}

export function normalizeDocsNavigationPath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
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

function firstDocsNavigationPagePath(items: DocsNavigationItem[]): string | undefined {
  for (const item of items) {
    if (item.path) return item.path;
    const descendant = firstDocsNavigationPagePath(item.children);
    if (descendant) return descendant;
  }
  return undefined;
}

// Structural sections have no page of their own — they resolve to their first
// navigable page so switching to them lands somewhere instead of only swapping
// the sidebar contents.
export function resolveDocsSectionTargetPath(section: DocsNavigationSection): string | undefined {
  return section.path ?? firstDocsNavigationPagePath(section.items);
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
