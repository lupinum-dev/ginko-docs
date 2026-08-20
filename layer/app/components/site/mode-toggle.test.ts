import { describe, expect, it } from "vite-plus/test";
import { nextColorModePreference, themeToggleIcon, themeToggleLabelKey } from "./mode-toggle.utils";

describe("mode-toggle.utils", () => {
  it("stores an override when the target differs from the OS preference", () => {
    expect(nextColorModePreference("light", "light")).toBe("dark");
    expect(nextColorModePreference("dark", "dark")).toBe("light");
  });

  it("clears the override when the target matches the OS preference", () => {
    expect(nextColorModePreference("dark", "light")).toBe("system");
    expect(nextColorModePreference("light", "dark")).toBe("system");
  });

  it("represents the rendered mode in the icon and action label", () => {
    expect(themeToggleIcon(true)).toBe("lucide:moon");
    expect(themeToggleIcon(false)).toBe("lucide:sun");
    expect(themeToggleLabelKey(true)).toBe("theme.switchToLight");
    expect(themeToggleLabelKey(false)).toBe("theme.switchToDark");
  });
});
