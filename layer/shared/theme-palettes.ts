export const GINKO_DOCS_NEUTRAL_PALETTES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "taupe",
  "mauve",
  "mist",
  "olive",
  "custom",
] as const;

export const GINKO_DOCS_PRIMARY_PALETTES = [
  "neutral",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "custom",
] as const;

export type GinkoDocsNeutralPalette = (typeof GINKO_DOCS_NEUTRAL_PALETTES)[number];
export type GinkoDocsPrimaryPalette = (typeof GINKO_DOCS_PRIMARY_PALETTES)[number];
