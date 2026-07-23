export type CommandCenterGroup = "recent" | "pages" | "docs_nav" | "actions" | "search";

export interface CommandCenterItem {
  id: string;
  sourceId?: string;
  title: string;
  subtitle?: string;
  href?: string;
  external?: boolean;
  group: CommandCenterGroup;
  icon?: string;
  keywords?: string[];
  badge?: string;
}

export type StoredRecentItem = string;

export interface CommandCenterGroupResult {
  id: CommandCenterGroup;
  title: string;
  items: CommandCenterItem[];
}

export const MAX_RECENT_ITEMS = 5;
export const PAGE_HIGHLIGHT_STORAGE_KEY = "site-command-center-page-highlight";

export function dedupeCommandCenterItems(items: CommandCenterItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.href ?? item.sourceId ?? item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupCommandCenterItems(
  items: CommandCenterItem[],
  groupTitle: (group: CommandCenterGroup) => string,
): CommandCenterGroupResult[] {
  const groups = new Map<CommandCenterGroup, CommandCenterItem[]>();
  for (const item of items) {
    const group = groups.get(item.group) ?? [];
    group.push(item);
    groups.set(item.group, group);
  }

  return [...groups].map(([id, groupItems]) => ({
    id,
    title: groupTitle(id),
    items: groupItems.slice(0, 5),
  }));
}

export function resolveRecentItems(
  storedItems: StoredRecentItem[],
  currentItems: CommandCenterItem[],
): CommandCenterItem[] {
  return storedItems
    .map((id) => currentItems.find((item) => item.id === id))
    .filter((item): item is CommandCenterItem => Boolean(item))
    .slice(0, MAX_RECENT_ITEMS)
    .map((item) => ({
      ...item,
      id: `recent-${item.id}`,
      sourceId: item.id,
      group: "recent",
    }));
}

export function rememberRecentItem(
  selectedItem: CommandCenterItem,
  storedItems: StoredRecentItem[],
): StoredRecentItem[] {
  const id = selectedItem.sourceId ?? selectedItem.id;
  return [id, ...storedItems.filter((item) => item !== id)].slice(0, MAX_RECENT_ITEMS);
}
