import { describe, expect, it } from "vite-plus/test";
import { nextExplicitColorMode, themeToggleIcon, themeToggleLabelKey } from "./mode-toggle.utils";

describe("mode-toggle.utils", () => {
  it("switches to the opposite explicit color mode", () => {
    expect(nextExplicitColorMode("dark")).toBe("light");
    expect(nextExplicitColorMode("light")).toBe("dark");
  });

  it("represents the rendered mode in the icon and action label", () => {
    expect(themeToggleIcon(true)).toBe("lucide:moon");
    expect(themeToggleIcon(false)).toBe("lucide:sun");
    expect(themeToggleLabelKey(true)).toBe("theme.switchToLight");
    expect(themeToggleLabelKey(false)).toBe("theme.switchToDark");
  });
});
