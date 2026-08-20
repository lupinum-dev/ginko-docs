import type { BundledTheme } from "shiki";

export type GinkoDocsSyntaxTheme = BundledTheme;

export interface GinkoDocsSyntaxHighlightingConfig {
  themes: {
    light: GinkoDocsSyntaxTheme;
    dark: GinkoDocsSyntaxTheme;
  };
}

export interface GinkoDocsNuxtConfig {
  syntaxHighlighting?: GinkoDocsSyntaxHighlightingConfig;
}
