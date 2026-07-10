export function resolveIconifyIcon(name?: string | null): string | undefined {
  if (!name?.trim()) return undefined;
  const n = name.trim();
  return n.includes(":") ? n : `lucide:${n.replace(/_/g, "-").toLowerCase()}`;
}

export function isExternalLink(to?: string | null) {
  return Boolean(to && /^(https?:)?\/\//.test(to));
}
