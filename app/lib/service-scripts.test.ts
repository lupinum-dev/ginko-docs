import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { siteConfig } from "../site.config";
import {
  getGoogleConsentState,
  getServiceScriptStates,
  googleConsentDenied,
  isServiceScriptLoadable,
  mapTrackingEventToPlausible,
} from "./service-scripts";
import { createTrackingEvent } from "./tracking/events";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

describe("service script loading", () => {
  it("keeps optional provider scripts disabled until the service and category consent are enabled", () => {
    expect(getServiceScriptStates({ analytics: true }, siteConfig)).toEqual([
      {
        id: "analytics.plausible",
        category: "analytics",
        enabled: false,
        consented: true,
        loadable: false,
      },
      {
        id: "analytics.ga4",
        category: "analytics",
        enabled: false,
        consented: true,
        loadable: false,
      },
      {
        id: "analytics.gtm",
        category: "analytics",
        enabled: false,
        consented: true,
        loadable: false,
      },
    ]);

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

    expect(
      isServiceScriptLoadable("analytics.plausible", { analytics: false }, withPlausible),
    ).toBe(false);
    expect(isServiceScriptLoadable("analytics.plausible", { analytics: true }, withPlausible)).toBe(
      true,
    );
  });

  it("maps sanitized tracking events to Plausible custom events", () => {
    const event = createTrackingEvent("cta_click", {
      email: "kunde@example.at",
      label: "Erstgespraech buchen",
      locale: "de",
      location: "hero",
    });

    expect(mapTrackingEventToPlausible(event)).toEqual({
      name: "cta_click",
      options: {
        props: {
          label: "Erstgespraech buchen",
          locale: "de",
          location: "hero",
        },
      },
    });
  });

  it("keeps Google consent mode denied before category consent exists", () => {
    expect(googleConsentDenied).toEqual({
      ad_personalization: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      analytics_storage: "denied",
    });
    expect(getGoogleConsentState({ analytics: false, marketing: false })).toEqual(
      googleConsentDenied,
    );
    expect(getGoogleConsentState({ analytics: true, marketing: false })).toEqual({
      ad_personalization: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      analytics_storage: "granted",
    });
  });

  it("keeps Nuxt Scripts behind the app-owned consent loader", () => {
    const nuxtConfig = readAppFile("nuxt.config.ts");
    const app = readAppFile("app/app.vue");
    const loader = readAppFile("app/components/site/ServiceLoader.vue");

    expect(nuxtConfig).toContain('"@nuxt/scripts"');
    expect(nuxtConfig).not.toMatch(/scripts:\s*{\s*registry:/);
    expect(app).toContain("<SiteServiceLoader");
    expect(loader).toContain("useScriptTriggerConsent");
    expect(loader).toContain("useScriptPlausibleAnalytics");
    expect(loader).toContain("useScriptGoogleAnalytics");
    expect(loader).toContain("useScriptGoogleTagManager");
    expect(loader).toContain("registerTrackingProvider");
    expect(loader).not.toMatch(/window\.(plausible|gtag|fbq|dataLayer)/);
  });
});
