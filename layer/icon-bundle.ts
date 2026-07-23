import { createRequire } from "node:module";

export const layerIconNames = [
  "circle-flags:de",
  "circle-flags:us",
  "logos:bun",
  "logos:npm-icon",
  "logos:nuxt-icon",
  "logos:pnpm",
  "logos:typescript-icon",
  "logos:vue",
  "logos:yarn",
  "lucide:arrow-left",
  "lucide:arrow-right",
  "lucide:arrow-up",
  "lucide:arrow-up-right",
  "lucide:atom",
  "lucide:badge-check",
  "lucide:blocks",
  "lucide:book-open",
  "lucide:bookmark",
  "lucide:calendar",
  "lucide:braces",
  "lucide:building-2",
  "lucide:check",
  "lucide:chevron-down",
  "lucide:chevron-left",
  "lucide:chevron-right",
  "lucide:chevrons-up-down",
  "lucide:circle",
  "lucide:circle-alert",
  "lucide:circle-check",
  "lucide:circle-help",
  "lucide:circle-x",
  "lucide:clipboard",
  "lucide:clock",
  "lucide:code-xml",
  "lucide:copy",
  "lucide:file",
  "lucide:file-code",
  "lucide:file-code-2",
  "lucide:file-cog",
  "lucide:file-json",
  "lucide:file-key",
  "lucide:file-text",
  "lucide:folder",
  "lucide:folder-open",
  "lucide:git-branch",
  "lucide:github",
  "lucide:hash",
  "lucide:home",
  "lucide:info",
  "lucide:lightbulb",
  "lucide:link",
  "lucide:linkedin",
  "lucide:loader-circle",
  "lucide:list",
  "lucide:menu",
  "lucide:message-circle",
  "lucide:monitor",
  "lucide:moon",
  "lucide:newspaper",
  "lucide:package",
  "lucide:palette",
  "lucide:panel-left-open",
  "lucide:pen-line",
  "lucide:plug",
  "lucide:search",
  "lucide:server",
  "lucide:sparkles",
  "lucide:sun",
  "lucide:table",
  "lucide:terminal",
  "lucide:thumbs-down",
  "lucide:thumbs-up",
  "lucide:triangle-alert",
  "lucide:trophy",
  "lucide:x",
  "lucide:zap",
] as const;

type IconTransform = {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
};
type IconData = IconTransform & { body: string };
type IconAlias = IconTransform & { parent: string };
type IconCollection = {
  prefix: string;
  width?: number;
  height?: number;
  icons: Record<string, IconData>;
  aliases?: Record<string, IconAlias>;
};

const require = createRequire(import.meta.url);
const sourceCollections = new Map<string, IconCollection>(
  ["circle-flags", "logos", "lucide"].map((prefix) => [
    prefix,
    require(`@iconify-json/${prefix}/icons.json`) as IconCollection,
  ]),
);

export const layerIconCollections: IconCollection[] = [...sourceCollections.values()].map(
  ({ prefix, width, height }) => ({ prefix, width, height, icons: {}, aliases: {} }),
);

const bundledCollections = new Map(
  layerIconCollections.map((collection) => [collection.prefix, collection]),
);

function includeIcon(prefix: string, name: string, seen = new Set<string>()) {
  const key = `${prefix}:${name}`;
  if (seen.has(key)) return;
  seen.add(key);

  const source = sourceCollections.get(prefix);
  const target = bundledCollections.get(prefix);
  if (!source || !target) return;

  const icon = source.icons[name];
  if (icon) {
    target.icons[name] = icon;
    return;
  }

  const alias = source.aliases?.[name];
  if (!alias) return;
  target.aliases![name] = alias;
  includeIcon(prefix, alias.parent, seen);
}

export function includeIconNames(names: Iterable<string>) {
  for (const icon of names) {
    const separator = icon.indexOf(":");
    if (separator < 1) continue;
    includeIcon(icon.slice(0, separator), icon.slice(separator + 1));
  }
}

includeIconNames(layerIconNames);
