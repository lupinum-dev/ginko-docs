import { describe, expect, it } from "vite-plus/test";
import {
  defaultLocale,
  isDefaultLocale,
  isLocaleCode,
  localeCodes,
  localeFromPath,
  localePrefix,
  localizedPath,
} from "./locales";

describe("locale registry", () => {
  it("defines one primary locale and ordered supported locale codes", () => {
    expect(defaultLocale).toBe("de");
    expect(localeCodes).toEqual(["en", "de"]);
    expect(isLocaleCode("en")).toBe(true);
    expect(isLocaleCode("de")).toBe(true);
    expect(isLocaleCode("fr")).toBe(false);
  });

  it("keeps prefix_except_default URL behavior centralized", () => {
    expect(isDefaultLocale("de")).toBe(true);
    expect(localePrefix("de")).toBe("");
    expect(localePrefix("en")).toBe("/en");
    expect(localizedPath("de", "/leistungen")).toBe("/leistungen");
    expect(localizedPath("en", "/services")).toBe("/en/services");
    expect(localizedPath("en", "/")).toBe("/en");
  });

  it("detects route locale from prefixes and falls back to the primary locale", () => {
    expect(localeFromPath("/")).toBe("de");
    expect(localeFromPath("/leistungen/website-strategie")).toBe("de");
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/en/services/website-strategy")).toBe("en");
  });

  it("can evaluate the same URL rules with a different primary locale", () => {
    expect(localePrefix("de", "de")).toBe("");
    expect(localePrefix("en", "de")).toBe("/en");
    expect(localizedPath("de", "/leistungen", "de")).toBe("/leistungen");
    expect(localizedPath("en", "/services", "de")).toBe("/en/services");
    expect(localeFromPath("/services", "de")).toBe("de");
  });
});
