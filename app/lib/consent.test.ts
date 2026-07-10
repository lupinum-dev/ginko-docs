import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { siteConfig } from "../site.config";
import {
  createAcceptedConsentPreferences,
  createDefaultConsentPreferences,
  createStoredConsentPreferences,
  getConsentCategories,
  getConsentVersion,
  normalizeConsentPreferences,
  shouldRequestConsent,
} from "./consent";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

describe("consent preferences", () => {
  it("derives configurable cookie categories from enabled services", () => {
    expect(getConsentCategories(siteConfig)).toEqual([
      {
        id: "essential",
        configurable: false,
        serviceIds: [],
      },
    ]);

    const withOptionalServices = {
      ...siteConfig,
      analytics: {
        ...siteConfig.analytics,
        plausible: {
          ...siteConfig.analytics.plausible,
          enabled: true,
        },
      },
      marketing: {
        ...siteConfig.marketing,
        metaPixel: {
          ...siteConfig.marketing.metaPixel,
          enabled: true,
        },
      },
      chat: {
        ...siteConfig.chat,
        enabled: true,
        provider: "brevo" as const,
      },
      embeds: {
        ...siteConfig.embeds,
        youtube: {
          ...siteConfig.embeds.youtube,
          enabled: true,
        },
      },
    };

    expect(getConsentCategories(withOptionalServices)).toEqual([
      {
        id: "essential",
        configurable: false,
        serviceIds: [],
      },
      {
        id: "analytics",
        configurable: true,
        serviceIds: ["analytics.plausible"],
      },
      {
        id: "marketing",
        configurable: true,
        serviceIds: ["marketing.metaPixel"],
      },
      {
        id: "support",
        configurable: true,
        serviceIds: ["support.chat"],
      },
      {
        id: "embeds",
        configurable: true,
        serviceIds: ["embeds.youtube"],
      },
    ]);
  });

  it("versions consent state from enabled optional service configuration", () => {
    const baseVersion = getConsentVersion(siteConfig);
    const withPlausible = {
      ...siteConfig,
      analytics: {
        ...siteConfig.analytics,
        plausible: {
          ...siteConfig.analytics.plausible,
          enabled: true,
        },
      },
    };
    const stored = createStoredConsentPreferences(
      createAcceptedConsentPreferences(withPlausible),
      withPlausible,
      new Date("2026-06-04T00:00:00.000Z"),
    );

    expect(baseVersion).toBe("consent-v1:no-optional-services");
    expect(stored.version).toContain("analytics.plausible:plausible:analytics");
    expect(stored.updatedAt).toBe("2026-06-04T00:00:00.000Z");
    expect(shouldRequestConsent(null, siteConfig)).toBe(false);
    expect(shouldRequestConsent(null, withPlausible)).toBe(true);
    expect(shouldRequestConsent(stored, withPlausible)).toBe(false);
    expect(shouldRequestConsent(stored, siteConfig)).toBe(false);
  });

  it("normalizes preferences to the current service categories", () => {
    const withEmbed = {
      ...siteConfig,
      embeds: {
        ...siteConfig.embeds,
        googleMaps: {
          ...siteConfig.embeds.googleMaps,
          enabled: true,
        },
      },
    };

    expect(createDefaultConsentPreferences(withEmbed)).toMatchObject({
      essential: true,
      embeds: false,
    });
    expect(normalizeConsentPreferences({ embeds: true, unknown: true }, withEmbed)).toEqual({
      essential: true,
      analytics: false,
      marketing: false,
      support: false,
      embeds: true,
    });
  });

  it("keeps the cookie modal wired to derived consent categories", () => {
    const modal = readAppFile("app/components/site/cookie/CookieSettings.vue");
    const consentComposable = readAppFile("app/composables/useCookieConsent.ts");
    const manager = readAppFile("app/components/site/cookie/CookieConsentManager.vue");
    const loader = readAppFile("app/components/site/ServiceLoader.vue");

    expect(modal).toContain("useCookieConsent");
    expect(modal).toContain('v-for="category in categories"');
    expect(modal).not.toContain("functional");
    expect(consentComposable).toContain("trackCookiePreferences");
    expect(consentComposable).toContain("createStoredConsentPreferences");
    expect(loader).toContain("useCookieConsent");
    expect(loader).toContain("isServiceScriptLoadable");
    expect(manager).toContain("needsConsent");
    expect(manager).toContain("<CookieBanner");
  });
});
