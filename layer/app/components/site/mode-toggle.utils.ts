export type RenderedColorMode = "light" | "dark";
export type StoredColorModePreference = "system" | RenderedColorMode;

/**
 * Next stored preference for a two-state theme toggle.
 *
 * Shows the resolved appearance, toggles to the opposite on click, and clears
 * the stored override when that target matches the OS preference.
 */
export function nextColorModePreference(
  currentRendered: RenderedColorMode,
  systemPreference: RenderedColorMode,
): StoredColorModePreference {
  const target = currentRendered === "dark" ? "light" : "dark";
  return target === systemPreference ? "system" : target;
}

export function readSystemColorMode(): RenderedColorMode {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function themeToggleIcon(isDark: boolean) {
  return isDark ? "lucide:moon" : "lucide:sun";
}

export function themeToggleLabelKey(isDark: boolean) {
  return isDark ? "theme.switchToLight" : "theme.switchToDark";
}
