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

export function getMarkdownTocLinks(body: unknown): TocLinkLike[] | undefined {
  if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;

  const root = body as { type?: unknown; children?: unknown; toc?: unknown };
  if (root.type !== "root" || !Array.isArray(root.children)) return undefined;
  if (!root.toc || typeof root.toc !== "object" || Array.isArray(root.toc)) return undefined;

  const links = (root.toc as { links?: unknown }).links;
  return Array.isArray(links) ? (links as TocLinkLike[]) : undefined;
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

export function filterTocByDepth(items: FlatTocItem[], maxDepth: number): FlatTocItem[] {
  return items.filter((item) => (item.depth ?? 2) <= maxDepth);
}
import { defaultLocale } from "../../i18n/locales";
