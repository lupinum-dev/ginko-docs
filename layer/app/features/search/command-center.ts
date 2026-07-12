export type CommandCenterGroup = "recent" | "pages" | "docs_nav" | "blog" | "docs" | "actions";

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

const GROUP_PRIORITY: Record<CommandCenterGroup, number> = {
  recent: 0,
  pages: 1,
  docs_nav: 2,
  blog: 3,
  docs: 4,
  actions: 5,
};

function normalizeValue(value: string) {
  return value.toLocaleLowerCase().trim();
}

export function dedupeCommandCenterItems(items: CommandCenterItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.href ?? item.sourceId ?? item.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function scoreCommandCenterItem(item: CommandCenterItem, query: string) {
  if (!query.trim()) return 1;

  const normalizedQuery = normalizeValue(query);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const title = normalizeValue(item.title);
  const subtitle = normalizeValue(item.subtitle ?? "");
  const keywords = (item.keywords ?? []).map(normalizeValue);
  const haystacks = [title, subtitle, ...keywords].filter(Boolean);
  const isAnchoredResult = item.href?.includes("#") ?? false;

  if (!tokens.every((token) => haystacks.some((value) => value.includes(token)))) return 0;

  let score = 0;
  if (title === normalizedQuery) score += isAnchoredResult ? 48 : 140;
  if (title.startsWith(normalizedQuery)) score += isAnchoredResult ? 40 : 110;
  if (title.includes(normalizedQuery)) score += isAnchoredResult ? 32 : 80;
  if (subtitle.includes(normalizedQuery)) score += 48;

  for (const keyword of keywords) {
    if (keyword === normalizedQuery) score += 90;
    else if (keyword.startsWith(normalizedQuery)) score += 56;
    else if (keyword.includes(normalizedQuery)) score += 32;
  }

  for (const token of tokens) {
    if (title.startsWith(token)) score += 18;
    if (title.includes(token)) score += 12;
    if (subtitle.includes(token)) score += 8;
    if (keywords.some((keyword) => keyword.startsWith(token))) score += 10;
  }

  if (item.href && !isAnchoredResult) score += 16;
  if (isAnchoredResult) score -= 12;
  if (item.group === "pages") score += 20;
  return score;
}

export function groupCommandCenterItems(
  items: CommandCenterItem[],
  query: string,
  groupTitle: (group: CommandCenterGroup) => string,
): CommandCenterGroupResult[] {
  const isSearching = query.trim().length > 0;
  const ranked = items
    .map((item) => ({
      item,
      score: item.group === "recent" && !isSearching ? 999 : scoreCommandCenterItem(item, query),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (isSearching && left.score !== right.score) return right.score - left.score;
      if (left.item.group !== right.item.group) {
        return GROUP_PRIORITY[left.item.group] - GROUP_PRIORITY[right.item.group];
      }
      return isSearching ? left.item.title.localeCompare(right.item.title) : 0;
    })
    .slice(0, isSearching ? 12 : undefined);

  const groups = new Map<CommandCenterGroup, Array<{ item: CommandCenterItem; score: number }>>();
  for (const entry of ranked) {
    const group = groups.get(entry.item.group) ?? [];
    group.push(entry);
    groups.set(entry.item.group, group);
  }

  return [...groups.entries()]
    .map(([id, entries]) => ({
      id,
      title: groupTitle(id),
      maxScore: Math.max(...entries.map((entry) => entry.score)),
      items: entries.slice(0, 5).map((entry) => entry.item),
    }))
    .sort((left, right) => {
      if (isSearching && left.maxScore !== right.maxScore) return right.maxScore - left.maxScore;
      return GROUP_PRIORITY[left.id] - GROUP_PRIORITY[right.id];
    })
    .map(({ maxScore: _maxScore, ...group }) => group);
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

export function contentSearchGroup(collection: string): "blog" | "docs" {
  return collection === "blog" ? "blog" : "docs";
}
