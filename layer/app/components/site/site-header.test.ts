import { describe, expect, it } from "vite-plus/test";
import { resolveSocialLinks } from "../../composables/site-navigation.utils";
import { layerIconNames } from "../../../icon-bundle";

describe("Style 08 header social behavior", () => {
  it("bundles the reference Discord brand icon", () => {
    expect(layerIconNames).toContain("logos:discord-icon");
  });

  it("renders no configured social destinations when social is empty", () => {
    expect(resolveSocialLinks({})).toEqual([]);
  });

  it("preserves configured social order for the header rail", () => {
    expect(
      resolveSocialLinks({
        github: "https://github.com/acme",
        discord: "https://discord.gg/acme",
      }).map((item) => item.platform),
    ).toEqual(["github", "discord"]);
  });
});
