import { parse as parseYaml } from "yaml";

export type ApiEntry = {
  name: string;
  annotation?: string;
  optional?: boolean;
  required?: boolean;
  deprecated?: boolean;
  since?: string;
  default?: string;
  description?: string;
};

export type ApiGroup = {
  label: string;
  entries: ApiEntry[];
};

export type InlinePart = {
  code: boolean;
  text: string;
};

function asBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function asText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

/**
 * Normalize the authored `groups` YAML into a strict structure. Groups without
 * a label or without at least one named entry are dropped, so a partially
 * authored document renders its valid parts instead of failing.
 */
export function normalizeApiGroups(input: unknown): ApiGroup[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((group): ApiGroup[] => {
    if (typeof group !== "object" || group === null) return [];
    const raw = group as Record<string, unknown>;
    const label = asText(raw.label)?.trim();
    if (!label || !Array.isArray(raw.entries)) return [];

    const entries = raw.entries.flatMap((entry): ApiEntry[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const rawEntry = entry as Record<string, unknown>;
      const name = asText(rawEntry.name)?.trim();
      if (!name) return [];
      const required = asBoolean(rawEntry.required);
      return [
        {
          name,
          annotation: asText(rawEntry.annotation),
          optional: asBoolean(rawEntry.optional) && !required,
          required,
          deprecated: asBoolean(rawEntry.deprecated),
          since: asText(rawEntry.since),
          default: asText(rawEntry.default),
          description: asText(rawEntry.description),
        },
      ];
    });

    return entries.length ? [{ label, entries }] : [];
  });
}

/**
 * Parse the authored YAML source from the panel's code block. Accepts either a
 * top-level `groups:` key or a bare list of groups; invalid YAML yields no
 * groups instead of throwing.
 */
export function parseApiSource(source: string): ApiGroup[] {
  if (!source.trim()) return [];
  let parsed: unknown;
  try {
    parsed = parseYaml(source);
  } catch {
    return [];
  }
  if (Array.isArray(parsed)) return normalizeApiGroups(parsed);
  if (typeof parsed === "object" && parsed !== null && "groups" in parsed) {
    return normalizeApiGroups((parsed as Record<string, unknown>).groups);
  }
  return [];
}

/**
 * Everything after the entry name, built mechanically so authors never write
 * signatures by hand: `?` + `: annotation` + ` = default`.
 */
export function signatureTail(entry: ApiEntry): string {
  let tail = entry.optional ? "?" : "";
  if (entry.annotation) tail += `: ${entry.annotation}`;
  if (entry.default) tail += ` = ${entry.default}`;
  return tail;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Stable deep-link id for an entry row, e.g. `api-flags-pm` for `--pm`. */
export function apiEntryId(groupLabel: string, name: string): string {
  return `api-${slugify(groupLabel)}-${slugify(name)}`;
}

/**
 * Split a description string on backtick pairs so inline code renders as
 * `<code>`. An unmatched backtick stays literal text.
 */
export function splitInlineCode(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let rest = text;
  for (;;) {
    const match = /`([^`]+)`/.exec(rest);
    if (!match) break;
    if (match.index > 0) parts.push({ code: false, text: rest.slice(0, match.index) });
    parts.push({ code: true, text: match[1]! });
    rest = rest.slice(match.index + match[0].length);
  }
  if (rest) parts.push({ code: false, text: rest });
  return parts;
}
