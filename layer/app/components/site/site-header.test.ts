import { describe, expect, it } from "vite-plus/test";
import { resolveSocialLinks } from "../../composables/site-navigation.utils";
import { layerIconNames } from "../../../icon-bundle";

describe("Style 08 header social behavior", () => {
  it("bundles the filled social brand icons", () => {
    expect(layerIconNames).toContain("ginko-social:github");
    expect(layerIconNames).toContain("ginko-social:discord");
    expect(resolveSocialLinks({ discord: "https://discord.gg/acme" })[0]?.icon).toBe(
      "ginko-social:discord",
    );
  });

  it("renders no configured social destinations when social is empty", () => {
    expect(resolveSocialLinks({})).toEqual([]);
  });

  it("preserves configured social order for the header rail", () => {
    expect(
      resolveSocialLinks({
        discord: "https://discord.gg/acme",
        github: "https://github.com/acme",
      }).map((item) => item.platform),
    ).toEqual(["discord", "github"]);
  });
});
