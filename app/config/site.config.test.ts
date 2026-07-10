import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { contentComponentTags } from "@lupinum/content-components/tags";
import { describe, expect, it } from "vite-plus/test";
import { messages } from "../../i18n/messages/index";
import { messageSource } from "../../i18n/messages/source";
import { defaultLocale, localeCodes } from "../../i18n/locales";
import { siteConfig } from "../site.config";
import {
  localeFromRoutePath,
  normalizeInternalPath,
  toRootMountedContentPath,
} from "../utils/content";
import {
  assertLaunchReady,
  findLaunchReadinessIssues,
  launchPlaceholderPatterns,
} from "./launch-readiness";
import {
  getPrivacyServiceInventory,
  getServiceRegistry,
  hasConfigurableOptionalServices,
  requiresConsentBanner,
} from "./service-registry";
import { validateSiteConfig } from "./site.schema";
import { formatSiteAddress, getLocalizedSiteText, resolveSiteUrl } from "./site.utils";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

function readCollectionBlock(source: string, name: string) {
  const start = source.indexOf(`export const ${name} = defineCollection({`);
  expect(start).toBeGreaterThanOrEqual(0);

  const nextCollection = source.indexOf("\nexport const ", start + 1);
  const defaultExport = source.indexOf("\nexport default", start + 1);
  const end = nextCollection === -1 ? defaultExport : nextCollection;

  return source.slice(start, end === -1 ? source.length : end);
}

describe("business config", () => {
  it("validates the canonical template config and required business fields", () => {
    expect(validateSiteConfig(siteConfig)).toEqual(siteConfig);
    expect(siteConfig.site.defaultLocale).toBe(defaultLocale);
    expect(siteConfig.site.locales).toEqual(localeCodes);
    expect(siteConfig.identity.countryProfile).toBe("AT");
    expect(formatSiteAddress(siteConfig)).toEqual([
      siteConfig.contact.address.street,
      `${siteConfig.contact.address.postalCode} ${siteConfig.contact.address.city}`,
      siteConfig.contact.address.country,
    ]);

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        contact: {
          ...siteConfig.contact,
          email: "",
        },
      }),
    ).toThrow();
  });

  it("uses verified Lupinum business data and remains launch-ready", () => {
    const issues = findLaunchReadinessIssues(siteConfig);

    expect(siteConfig.identity.legalName).toBe("Lupinum OG");
    expect(siteConfig.identity.managingDirectors).toEqual([]);
    expect(siteConfig.identity.vatId).toBe("ATU80979201");
    expect(siteConfig.identity.registry).toBe("FN 629500 k");
    expect(siteConfig.identity.registryCourt).toBe("Handelsgericht St. Pölten");
    expect(siteConfig.legal.responsibleForContent).toBeUndefined();
    expect(issues).toEqual([]);
    expect(() => assertLaunchReady(siteConfig)).not.toThrow();
    expect(launchPlaceholderPatterns.some((pattern) => pattern.test("Musterbetrieb"))).toBe(true);
    expect(launchPlaceholderPatterns.some((pattern) => pattern.test("GTM-XXXXXXX"))).toBe(true);
  });

  it("requires explicit provider values only when optional providers are enabled", () => {
    expect(validateSiteConfig(siteConfig)).toEqual(siteConfig);

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        analytics: {
          ...siteConfig.analytics,
          plausible: {
            ...siteConfig.analytics.plausible,
            enabled: true,
            domain: undefined,
          },
        },
      }),
    ).toThrow("Enabled Plausible analytics requires a domain");

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        analytics: {
          ...siteConfig.analytics,
          ga4: {
            ...siteConfig.analytics.ga4,
            enabled: true,
            id: undefined,
          },
        },
      }),
    ).toThrow("Enabled GA4 analytics requires an id");

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        analytics: {
          ...siteConfig.analytics,
          gtm: {
            ...siteConfig.analytics.gtm,
            enabled: true,
            id: undefined,
          },
        },
      }),
    ).toThrow("Enabled GTM analytics requires an id");

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        marketing: {
          ...siteConfig.marketing,
          metaPixel: {
            ...siteConfig.marketing.metaPixel,
            enabled: true,
            id: undefined,
          },
        },
      }),
    ).toThrow("Enabled metaPixel marketing requires an id");

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        marketing: {
          ...siteConfig.marketing,
          linkedinInsight: {
            ...siteConfig.marketing.linkedinInsight,
            enabled: true,
            id: undefined,
          },
        },
      }),
    ).toThrow("Enabled linkedinInsight marketing requires an id");

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        chat: {
          ...siteConfig.chat,
          enabled: true,
          provider: "brevo",
          providerId: undefined,
        },
      }),
    ).toThrow("Enabled chat requires a provider id");
  });

  it("keeps supported UI variants explicit in the schema", () => {
    expect(
      validateSiteConfig({
        ...siteConfig,
        site: {
          ...siteConfig.site,
          localeSwitcher: "segmented",
        },
      }).site.localeSwitcher,
    ).toBe("segmented");

    for (const docsSidebarSwitcher of ["dropdown", "list", "tabs"] as const) {
      expect(
        validateSiteConfig({
          ...siteConfig,
          site: {
            ...siteConfig.site,
            docsSidebarSwitcher,
          },
        }).site.docsSidebarSwitcher,
      ).toBe(docsSidebarSwitcher);
    }

    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        site: {
          ...siteConfig.site,
          localeSwitcher: "tabs",
        },
      }),
    ).toThrow();
    expect(() =>
      validateSiteConfig({
        ...siteConfig,
        site: {
          ...siteConfig.site,
          docsSidebarSwitcher: "segmented",
        },
      }),
    ).toThrow();
  });

  it("localizes config-owned text and protects production canonical URLs", () => {
    expect(getLocalizedSiteText(siteConfig.site.description, "de")).toContain("B2B-Websites");
    expect(getLocalizedSiteText(siteConfig.site.description, "en")).toContain("B2B websites");
    expect(getLocalizedSiteText({ de: "Deutsch" }, "en")).toBe("Deutsch");
    expect(
      resolveSiteUrl(siteConfig.site.url, {
        envUrl: "http://127.0.0.1:3000",
        mode: "development",
      }),
    ).toBe("http://127.0.0.1:3000");
    expect(
      resolveSiteUrl(siteConfig.site.url, {
        envUrl: "http://localhost:3000",
        mode: "test",
      }),
    ).toBe("http://localhost:3000");
    expect(
      resolveSiteUrl(siteConfig.site.url, {
        envUrl: "http://127.0.0.1:3000",
        mode: "production",
      }),
    ).toBe(siteConfig.site.url);
    expect(resolveSiteUrl(siteConfig.site.url, { envUrl: "https://customer.example" })).toBe(
      "https://customer.example",
    );
  });

  it("derives locale-sensitive config from the locale registry", () => {
    const nuxtConfig = readAppFile("nuxt.config.ts");
    const vueI18nConfig = readAppFile("i18n/i18n.config.ts");
    const siteSchema = readAppFile("app/config/site.schema.ts");

    expect(nuxtConfig).toContain("defaultLocale,");
    expect(nuxtConfig).toContain("locales,");
    expect(nuxtConfig).toContain("localeCodes");
    expect(nuxtConfig).toContain("contentLocaleFallback");
    expect(nuxtConfig).not.toContain('defaultLocale: "en"');
    expect(nuxtConfig).not.toContain('locales: ["en", "de"]');
    expect(vueI18nConfig).toContain("locale: defaultLocale");
    expect(vueI18nConfig).toContain("fallbackLocale: defaultLocale");
    expect(siteSchema).toContain("z.enum(localeCodes)");
  });

  it("derives consent and privacy inventory from the business config", () => {
    const registry = getServiceRegistry(siteConfig);

    expect(registry.map((service) => service.category)).toEqual(
      expect.arrayContaining(["essential", "analytics", "marketing", "support", "embeds"]),
    );
    expect(getPrivacyServiceInventory(siteConfig).map((service) => service.id)).toEqual([]);
    expect(requiresConsentBanner(siteConfig)).toBe(false);
    expect(hasConfigurableOptionalServices(siteConfig)).toBe(false);

    expect(
      getPrivacyServiceInventory({
        ...siteConfig,
        forms: {
          ...siteConfig.forms,
          endpoints: {
            contact: {
              provider: "basin",
              productionEndpoint: "https://usebasin.com/f/contact",
            },
          },
        },
      }).map((service) => service.id),
    ).toEqual(["forms.basin"]);

    const enabledOptionalServices = {
      ...siteConfig,
      analytics: {
        ...siteConfig.analytics,
        plausible: {
          ...siteConfig.analytics.plausible,
          enabled: true,
          domain: "business.example",
        },
        ga4: {
          ...siteConfig.analytics.ga4,
          enabled: true,
          id: "G-1234567890",
        },
        gtm: {
          ...siteConfig.analytics.gtm,
          enabled: true,
          id: "GTM-1234567",
        },
      },
      marketing: {
        ...siteConfig.marketing,
        metaPixel: {
          ...siteConfig.marketing.metaPixel,
          enabled: true,
          id: "123456789012345",
        },
        linkedinInsight: {
          ...siteConfig.marketing.linkedinInsight,
          enabled: true,
          id: "1234567",
        },
      },
      chat: {
        ...siteConfig.chat,
        enabled: true,
        provider: "brevo" as const,
        providerId: "brevo-project-id",
      },
      embeds: {
        ...siteConfig.embeds,
        youtube: {
          ...siteConfig.embeds.youtube,
          enabled: true,
        },
        vimeo: {
          ...siteConfig.embeds.vimeo,
          enabled: true,
        },
        googleMaps: {
          ...siteConfig.embeds.googleMaps,
          enabled: true,
        },
        calCom: {
          ...siteConfig.embeds.calCom,
          enabled: true,
        },
        calendly: {
          ...siteConfig.embeds.calendly,
          enabled: true,
        },
      },
    };

    expect(getServiceRegistry(siteConfig).find((service) => service.id === "forms.basin")).toEqual(
      expect.objectContaining({
        status: "disabled",
        requiresConsent: false,
      }),
    );
    expect(
      getServiceRegistry(enabledOptionalServices)
        .filter((service) => service.requiresConsent)
        .map((service) => service.id),
    ).toEqual([
      "analytics.plausible",
      "analytics.ga4",
      "analytics.gtm",
      "marketing.metaPixel",
      "marketing.linkedinInsight",
      "support.chat",
      "embeds.youtube",
      "embeds.vimeo",
      "embeds.googleMaps",
      "embeds.calCom",
      "embeds.calendly",
    ]);
    expect(
      getPrivacyServiceInventory(enabledOptionalServices).map((service) => service.id),
    ).toEqual([
      "analytics.plausible",
      "analytics.ga4",
      "analytics.gtm",
      "marketing.metaPixel",
      "marketing.linkedinInsight",
      "support.chat",
      "embeds.youtube",
      "embeds.vimeo",
      "embeds.googleMaps",
      "embeds.calCom",
      "embeds.calendly",
    ]);
    expect(requiresConsentBanner(enabledOptionalServices)).toBe(true);
    expect(hasConfigurableOptionalServices(enabledOptionalServices)).toBe(true);
  });

  it("keeps generic content components separate from app-specific business tags", () => {
    const nuxtConfig = readAppFile("nuxt.config.ts");

    expect(nuxtConfig).toContain('"@lupinum/content-components"');
    expect(contentComponentTags).toMatchObject({
      accordion: "MdcAccordion",
      callout: "MdcCallout",
      tabs: "MdcTabs",
    });
    expect(contentComponentTags).not.toHaveProperty("business-contact");
    expect(contentComponentTags).not.toHaveProperty("business-imprint");
    expect(contentComponentTags).not.toHaveProperty("privacy-services");
    expect(nuxtConfig).toContain('"business-contact": "MdcBusinessContact"');
    expect(nuxtConfig).toContain('"business-imprint": "MdcBusinessImprint"');
    expect(nuxtConfig).toContain('"privacy-services": "MdcPrivacyServices"');
    expect(existsSync(join(appRoot, "app/components/prose"))).toBe(false);
  });

  it("derives locale-shaped i18n messages from colocated source messages", () => {
    const pageKeys = ["home", "contact", "services", "references", "thankYou", "about", "campaign"];

    expect(Object.keys(messageSource.pages)).toEqual(pageKeys);
    expect(Object.keys(messages.de.pages)).toEqual(pageKeys);
    expect(Object.keys(messages.en.pages)).toEqual(pageKeys);
  });

  it("keeps legal content and route helpers translated from one content model", () => {
    const contentConfig = readAppFile("content.config.ts");
    const legalCollection = readCollectionBlock(contentConfig, "legal");

    expect(legalCollection).toContain('source: "*.md"');
    expect(legalCollection).toContain('route: collectionRouteMap("home")');
    expect(legalCollection).not.toContain("sitemap: false");

    for (const [legalType, germanContentPath, englishContentPath] of [
      ["privacy", "content/de/3.datenschutz.md", "content/en/3.privacy.md"],
      ["imprint", "content/de/4.impressum.md", "content/en/4.imprint.md"],
      ["terms", "content/de/5.agb.md", "content/en/5.terms.md"],
    ] as const) {
      const german = readAppFile(germanContentPath);
      const english = readAppFile(englishContentPath);

      expect(german).toContain(`legalType: ${legalType}`);
      expect(english).toContain(`legalType: ${legalType}`);
      expect(german).not.toBe(english);
    }

    expect(toRootMountedContentPath("/datenschutz", "de")).toBe("/datenschutz");
    expect(toRootMountedContentPath("/en/privacy", "en")).toBe("/privacy");
    expect(toRootMountedContentPath("/en//privacy", "en")).toBe("/privacy");
    expect(localeFromRoutePath("/leistungen/website-strategie")).toBe("de");
    expect(localeFromRoutePath("/en/services/website-strategy")).toBe("en");
    expect(normalizeInternalPath("/en//terms")).toBe("/en/terms");
  });

  it("keeps business page collections localized and sitemap-visible", () => {
    const contentConfig = readAppFile("content.config.ts");

    for (const collection of ["docs", "blog", "services", "references", "legal"]) {
      const collectionBlock = readCollectionBlock(contentConfig, collection);

      expect(collectionBlock).toContain('type: "page"');
      expect(collectionBlock).toContain("i18n: true");
      expect(collectionBlock).not.toContain("sitemap: false");
    }

    for (const [collection, routeKey] of [
      ["docs", "docs"],
      ["services", "services"],
      ["references", "references"],
    ] as const) {
      const collectionBlock = readCollectionBlock(contentConfig, collection);
      expect(collectionBlock).toContain(`route: collectionRouteMap("${routeKey}")`);
    }
  });
});
