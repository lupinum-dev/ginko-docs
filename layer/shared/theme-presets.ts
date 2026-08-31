export const GINKO_DOCS_THEME_PRESETS = ["default", "nuxt"] as const;

export type GinkoDocsThemePreset = (typeof GINKO_DOCS_THEME_PRESETS)[number];
