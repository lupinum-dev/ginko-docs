import { siteConfig } from "../site.config";
import type { LocalizedText, SiteConfig } from "./site.schema";
import { getLocalizedSiteText } from "./site.utils";

export type ServiceCategory = SiteConfig["chat"]["consentCategory"];
export type ServiceStatus = "configured" | "disabled" | "enabled";

export interface ServiceEntry {
  id: string;
  provider: string;
  category: ServiceCategory;
  status: ServiceStatus;
  requiresConsent: boolean;
  consentMode?: boolean;
  label: LocalizedText;
  description: LocalizedText;
}

function hasConfiguredFormEndpoint(config: SiteConfig) {
  return Object.values(config.forms.endpoints).some((endpoint) => endpoint.productionEndpoint);
}

function optionalServiceRequiresConsent(category: ServiceCategory, enabled: boolean) {
  return enabled && category !== "essential";
}

function optionalStatus(enabled: boolean): ServiceStatus {
  return enabled ? "enabled" : "disabled";
}

function optionalService(
  entry: Omit<ServiceEntry, "requiresConsent" | "status"> & { enabled: boolean },
): ServiceEntry {
  const { enabled, ...service } = entry;

  return {
    ...service,
    status: optionalStatus(enabled),
    requiresConsent: optionalServiceRequiresConsent(service.category, enabled),
  };
}

export function getServiceRegistry(config: SiteConfig = siteConfig): ServiceEntry[] {
  const formsConfigured = hasConfiguredFormEndpoint(config);

  return [
    {
      id: "forms.basin",
      provider: config.forms.provider,
      category: "essential",
      status: formsConfigured ? "configured" : "disabled",
      requiresConsent: false,
      label: {
        de: "Basin Formular-Endpunkte",
        en: "Basin form endpoints",
      },
      description: {
        de: "Basin verarbeitet Kontaktformular-Anfragen, die Besucher aktiv absenden, sobald produktive Formular-Endpunkte konfiguriert sind.",
        en: "Basin processes contact form requests visitors actively submit once production form endpoints are configured.",
      },
    },
    optionalService({
      id: "analytics.plausible",
      provider: "plausible",
      category: config.analytics.plausible.consentCategory,
      enabled: config.analytics.plausible.enabled,
      label: {
        de: "Plausible Analytics",
        en: "Plausible Analytics",
      },
      description: {
        de: "Plausible misst Seitenaufrufe und Ereignisse datensparsam, wenn der Dienst aktiviert ist.",
        en: "Plausible measures page views and events with a privacy-friendly setup when enabled.",
      },
    }),
    optionalService({
      id: "analytics.ga4",
      provider: "ga4",
      category: config.analytics.ga4.consentCategory,
      enabled: config.analytics.ga4.enabled,
      consentMode: config.analytics.ga4.consentMode,
      label: {
        de: "Google Analytics 4",
        en: "Google Analytics 4",
      },
      description: {
        de: "Google Analytics 4 ist optional und muss mit Consent Mode eingebunden werden, bevor Tracking aktiviert wird.",
        en: "Google Analytics 4 is optional and must be wired through consent mode before tracking is enabled.",
      },
    }),
    optionalService({
      id: "analytics.gtm",
      provider: "gtm",
      category: config.analytics.gtm.consentCategory,
      enabled: config.analytics.gtm.enabled,
      consentMode: config.analytics.gtm.consentMode,
      label: {
        de: "Google Tag Manager",
        en: "Google Tag Manager",
      },
      description: {
        de: "Google Tag Manager ist optional und darf nur mit Consent Mode und freigegebenen Tags geladen werden.",
        en: "Google Tag Manager is optional and may only load with consent mode and approved tags.",
      },
    }),
    optionalService({
      id: "marketing.metaPixel",
      provider: "meta",
      category: config.marketing.metaPixel.consentCategory,
      enabled: config.marketing.metaPixel.enabled,
      label: {
        de: "Meta Pixel",
        en: "Meta Pixel",
      },
      description: {
        de: "Meta Pixel ist ein optionaler Marketing-Dienst und bleibt deaktiviert, bis ein Projekt ihn bewusst einschaltet.",
        en: "Meta Pixel is an optional marketing service and stays disabled until a project explicitly enables it.",
      },
    }),
    optionalService({
      id: "marketing.linkedinInsight",
      provider: "linkedin",
      category: config.marketing.linkedinInsight.consentCategory,
      enabled: config.marketing.linkedinInsight.enabled,
      label: {
        de: "LinkedIn Insight Tag",
        en: "LinkedIn Insight Tag",
      },
      description: {
        de: "LinkedIn Insight ist ein optionaler Marketing-Dienst und braucht Zustimmung vor dem Laden.",
        en: "LinkedIn Insight is an optional marketing service and requires consent before loading.",
      },
    }),
    optionalService({
      id: "support.chat",
      provider: config.chat.provider,
      category: config.chat.consentCategory,
      enabled: config.chat.enabled,
      label: {
        de: "Chatbot Support",
        en: "Chatbot support",
      },
      description: {
        de: "Der Chatbot ist optional. Anbieter mit Cookies, Tracking oder Drittanbieter-Skripten brauchen eine Zustimmung vor dem Laden.",
        en: "The chatbot is optional. Providers that set cookies, track users, or load third-party scripts require consent before loading.",
      },
    }),
    optionalService({
      id: "embeds.youtube",
      provider: "youtube",
      category: config.embeds.youtube.consentCategory,
      enabled: config.embeds.youtube.enabled,
      label: {
        de: "YouTube Einbettungen",
        en: "YouTube embeds",
      },
      description: {
        de: "YouTube-Videos sind optionale Einbettungen und werden erst nach passender Freigabe geladen.",
        en: "YouTube videos are optional embeds and load only after the matching permission exists.",
      },
    }),
    optionalService({
      id: "embeds.vimeo",
      provider: "vimeo",
      category: config.embeds.vimeo.consentCategory,
      enabled: config.embeds.vimeo.enabled,
      label: {
        de: "Vimeo Einbettungen",
        en: "Vimeo embeds",
      },
      description: {
        de: "Vimeo-Videos sind optionale Einbettungen und werden erst nach passender Freigabe geladen.",
        en: "Vimeo videos are optional embeds and load only after the matching permission exists.",
      },
    }),
    optionalService({
      id: "embeds.googleMaps",
      provider: "google-maps",
      category: config.embeds.googleMaps.consentCategory,
      enabled: config.embeds.googleMaps.enabled,
      label: {
        de: "Google Maps Einbettungen",
        en: "Google Maps embeds",
      },
      description: {
        de: "Google Maps ist eine optionale Karten-Einbettung und wird erst nach Zustimmung geladen.",
        en: "Google Maps is an optional map embed and loads only after consent.",
      },
    }),
    optionalService({
      id: "embeds.calCom",
      provider: "cal.com",
      category: config.embeds.calCom.consentCategory,
      enabled: config.embeds.calCom.enabled,
      label: {
        de: "Cal.com Einbettungen",
        en: "Cal.com embeds",
      },
      description: {
        de: "Cal.com ist eine optionale Termin-Einbettung und wird erst nach Zustimmung geladen, wenn das Projekt sie aktiviert.",
        en: "Cal.com is an optional scheduling embed and loads only after consent when a project enables it.",
      },
    }),
    optionalService({
      id: "embeds.calendly",
      provider: "calendly",
      category: config.embeds.calendly.consentCategory,
      enabled: config.embeds.calendly.enabled,
      label: {
        de: "Calendly Einbettungen",
        en: "Calendly embeds",
      },
      description: {
        de: "Calendly ist eine optionale Termin-Einbettung und wird erst nach Zustimmung geladen, wenn das Projekt sie aktiviert.",
        en: "Calendly is an optional scheduling embed and loads only after consent when a project enables it.",
      },
    }),
  ];
}

export function getPrivacyServiceInventory(config: SiteConfig = siteConfig) {
  return getServiceRegistry(config).filter((service) => service.status !== "disabled");
}

export function requiresConsentBanner(config: SiteConfig = siteConfig) {
  return getServiceRegistry(config).some((service) => service.requiresConsent);
}

export function hasConfigurableOptionalServices(config: SiteConfig = siteConfig) {
  return getServiceRegistry(config).some(
    (service) => service.status === "enabled" && service.category !== "essential",
  );
}

export function getLocalizedServiceText(value: LocalizedText, locale: string) {
  return getLocalizedSiteText(value, locale);
}
