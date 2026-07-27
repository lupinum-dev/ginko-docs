import { describe, expect, it } from "vite-plus/test";
import { assertDocsReleaseCertification, npmTagForVersion } from "./lib/release-publish.mjs";

describe("release publish policy", () => {
  it("selects the npm channel from the package version", () => {
    expect(npmTagForVersion("0.2.3")).toBe("latest");
    expect(npmTagForVersion("0.3.0-rc.1")).toBe("next");
  });

  it("requires the exact fixture certification lanes", () => {
    const certification = {
      lanes: ["single-tabs", "i18n-dropdown", "i18n-list"],
    };

    expect(() => assertDocsReleaseCertification(certification)).not.toThrow();
    expect(() => assertDocsReleaseCertification({ lanes: [] })).toThrow(
      "every required fixture lane",
    );
    expect(() =>
      assertDocsReleaseCertification({
        lanes: [...certification.lanes, "unknown"],
      }),
    ).toThrow("every required fixture lane");
  });
});
