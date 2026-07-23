import { describe, expect, it } from "vite-plus/test";
import { validateCodeTreePaths } from "./code-tree.utils";

describe("validateCodeTreePaths", () => {
  it("accepts distinct nested file paths and a matching default", () => {
    expect(() =>
      validateCodeTreePaths(["app/app.vue", "app/lib/config.ts"], "app/app.vue"),
    ).not.toThrow();
  });

  it.each([
    [[], undefined],
    [[""], undefined],
    [["app//index.ts"], undefined],
    [["app/../index.ts"], undefined],
    [["app.vue", "app.vue"], undefined],
    [["app", "app/index.ts"], undefined],
    [["app.vue"], "missing.vue"],
  ] as const)("rejects ambiguous path input %#", (paths, defaultValue) => {
    expect(() => validateCodeTreePaths([...paths], defaultValue)).toThrow();
  });
});
