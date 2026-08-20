import { describe, expect, it } from "vite-plus/test";
import { nextColorModePreference, themeToggleIcon, themeToggleLabelKey } from "./mode-toggle.utils";

describe("mode-toggle.utils", () => {
  it("stores the reader's explicit opposite mode", () => {
    expect(nextColorModePreference("light")).toBe("dark");
    expect(nextColorModePreference("dark")).toBe("light");
  });

  it("represents the rendered mode in the icon and action label", () => {
    expect(themeToggleIcon(true)).toBe("lucide:moon");
    expect(themeToggleIcon(false)).toBe("lucide:sun");
    expect(themeToggleLabelKey(true)).toBe("theme.switchToLight");
    expect(themeToggleLabelKey(false)).toBe("theme.switchToDark");
  });
});
