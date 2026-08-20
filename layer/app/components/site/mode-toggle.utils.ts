export type RenderedColorMode = "light" | "dark";
/**
 * Next stored preference for a two-state theme toggle.
 *
 * The page follows the operating system until the first interaction. After
 * that interaction, the reader's explicit light or dark choice remains fixed.
 */
export function nextColorModePreference(currentRendered: RenderedColorMode): RenderedColorMode {
  return currentRendered === "dark" ? "light" : "dark";
}

export function themeToggleIcon(isDark: boolean) {
  return isDark ? "lucide:moon" : "lucide:sun";
}

export function themeToggleLabelKey(isDark: boolean) {
  return isDark ? "theme.switchToLight" : "theme.switchToDark";
}
