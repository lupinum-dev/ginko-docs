/** Normalize CMS / Ginko icon strings for `<Icon name="…" />` (Iconify). */
export function toIconifyName(name: string | undefined | null): string | undefined {
  if (!name?.trim()) return undefined;
  const raw = name.trim();
  if (raw.includes(":")) return raw;
  return `lucide:${raw.replace(/_/g, "-").toLowerCase()}`;
}
