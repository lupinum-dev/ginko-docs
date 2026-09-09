import type { BundledTheme } from "shiki";
import type { LocaleCode } from "../../i18n/locales";

export type GinkoDocsSyntaxTheme = BundledTheme;

export interface GinkoDocsSyntaxHighlightingConfig {
  themes: {
    light: GinkoDocsSyntaxTheme;
    dark: GinkoDocsSyntaxTheme;
  };
}

export interface GinkoDocsNuxtConfig {
  /** Locale that owns unprefixed routes. */
  primaryLocale?: LocaleCode;
  syntaxHighlighting?: GinkoDocsSyntaxHighlightingConfig;
}
