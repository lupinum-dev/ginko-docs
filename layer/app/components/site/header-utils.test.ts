import { describe, expect, it } from "vite-plus/test";
import { headerUtilityButtonClass } from "./header-utils";

describe("header-utils", () => {
  it("uses the shared 36px ghost geometry for utility controls", () => {
    expect(headerUtilityButtonClass).toContain("size-9");
    expect(headerUtilityButtonClass).toContain("rounded-lg");
    expect(headerUtilityButtonClass).toContain("text-foreground");
    expect(headerUtilityButtonClass).toContain("hover:text-primary");
  });
});
