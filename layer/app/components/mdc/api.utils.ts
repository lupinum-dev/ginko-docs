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

function authoredError(message: string): never {
  throw new TypeError(`Invalid API groups: ${message}`);
}

function requiredText(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim())
    authoredError(`${path} must be a non-empty string`);
  return value.trim();
}

function optionalText(value: unknown, path: string): string | undefined {
  if (value === undefined) return undefined;
  return requiredText(value, path);
}

function optionalBoolean(value: unknown, path: string): boolean {
  if (value === undefined) return false;
  if (typeof value !== "boolean") authoredError(`${path} must be a boolean`);
  return value;
}

export function normalizeApiGroups(input: unknown): ApiGroup[] {
  if (!Array.isArray(input) || input.length === 0) {
    authoredError("groups must be a non-empty array");
  }

  const labels = new Set<string>();
  const ids = new Set<string>();
  return input.map((group, groupIndex): ApiGroup => {
    if (typeof group !== "object" || group === null || Array.isArray(group)) {
      authoredError(`groups[${groupIndex}] must be an object`);
    }
    const raw = group as Record<string, unknown>;
    const label = requiredText(raw.label, `groups[${groupIndex}].label`);
    if (labels.has(label)) authoredError(`duplicate group label "${label}"`);
    labels.add(label);
    if (!Array.isArray(raw.entries) || raw.entries.length === 0) {
      authoredError(`groups[${groupIndex}].entries must be a non-empty array`);
    }

    const names = new Set<string>();
    const entries = raw.entries.map((entry, entryIndex): ApiEntry => {
      const path = `groups[${groupIndex}].entries[${entryIndex}]`;
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
        authoredError(`${path} must be an object`);
      }
      const rawEntry = entry as Record<string, unknown>;
      const name = requiredText(rawEntry.name, `${path}.name`);
      if (names.has(name)) authoredError(`duplicate entry name "${name}" in group "${label}"`);
      names.add(name);
      const required = optionalBoolean(rawEntry.required, `${path}.required`);
      const optional = optionalBoolean(rawEntry.optional, `${path}.optional`);
      if (required && optional) authoredError(`${path} cannot be both required and optional`);
      const id = apiEntryId(label, name);
      if (ids.has(id)) authoredError(`duplicate generated entry id "${id}"`);
      ids.add(id);
      return {
        name,
        annotation: optionalText(rawEntry.annotation, `${path}.annotation`),
        optional,
        required,
        deprecated: optionalBoolean(rawEntry.deprecated, `${path}.deprecated`),
        since: optionalText(rawEntry.since, `${path}.since`),
        default: optionalText(rawEntry.default, `${path}.default`),
        description: optionalText(rawEntry.description, `${path}.description`),
      };
    });
    return { label, entries };
  });
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
