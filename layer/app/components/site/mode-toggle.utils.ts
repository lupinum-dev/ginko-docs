export type RenderedColorMode = "light" | "dark";

export function nextExplicitColorMode(current: RenderedColorMode): RenderedColorMode {
  return current === "dark" ? "light" : "dark";
}

export function themeToggleIcon(isDark: boolean) {
  return isDark ? "lucide:moon" : "lucide:sun";
}

export function themeToggleLabelKey(isDark: boolean) {
  return isDark ? "theme.switchToLight" : "theme.switchToDark";
}
