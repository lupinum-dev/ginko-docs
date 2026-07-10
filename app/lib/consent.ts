import { siteConfig } from "../site.config";
import type { SiteConfig } from "../config/site.schema";
import {
  getServiceRegistry,
  requiresConsentBanner,
  type ServiceCategory,
} from "../config/service-registry";

export type ConsentPreferences = Record<ServiceCategory, boolean>;

export interface ConsentCategoryEntry {
  id: ServiceCategory;
  configurable: boolean;
  serviceIds: string[];
}

export interface StoredConsentPreferences {
  version: string;
  preferences: ConsentPreferences;
  updatedAt: string;
}

const consentCategoryOrder: ServiceCategory[] = [
  "essential",
  "analytics",
  "marketing",
  "support",
  "embeds",
];

function emptyPreferences(): ConsentPreferences {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    support: false,
    embeds: false,
  };
}

export function getConsentCategories(config: SiteConfig = siteConfig): ConsentCategoryEntry[] {
  const servicesByCategory = new Map<ServiceCategory, string[]>(
    consentCategoryOrder.map((category) => [category, []]),
  );

  for (const service of getServiceRegistry(config)) {
    if (service.status === "disabled") continue;
    servicesByCategory.get(service.category)?.push(service.id);
  }

  return consentCategoryOrder.flatMap((category) => {
    const serviceIds = servicesByCategory.get(category) ?? [];
    if (category !== "essential" && serviceIds.length === 0) return [];

    return {
      id: category,
      configurable: category !== "essential",
      serviceIds,
    };
  });
}

export function getConsentVersion(config: SiteConfig = siteConfig) {
  const enabledOptionalServices = getServiceRegistry(config)
    .filter((service) => service.status === "enabled" && service.category !== "essential")
    .map((service) =>
      [service.id, service.provider, service.category, service.consentMode ? "consent-mode" : ""]
        .filter(Boolean)
        .join(":"),
    )
    .sort();

  return `consent-v1:${enabledOptionalServices.join("|") || "no-optional-services"}`;
}

export function createDefaultConsentPreferences(
  config: SiteConfig = siteConfig,
): ConsentPreferences {
  const preferences = emptyPreferences();

  for (const category of getConsentCategories(config)) {
    preferences[category.id] = category.id === "essential";
  }

  return preferences;
}

export function createAcceptedConsentPreferences(
  config: SiteConfig = siteConfig,
): ConsentPreferences {
  const preferences = createDefaultConsentPreferences(config);

  for (const category of getConsentCategories(config)) {
    preferences[category.id] = true;
  }

  return preferences;
}

export function normalizeConsentPreferences(
  input: Partial<Record<string, boolean>> | null | undefined,
  config: SiteConfig = siteConfig,
): ConsentPreferences {
  const preferences = createDefaultConsentPreferences(config);

  for (const category of getConsentCategories(config)) {
    if (category.id === "essential") {
      preferences.essential = true;
      continue;
    }

    preferences[category.id] = Boolean(input?.[category.id]);
  }

  return preferences;
}

export function createStoredConsentPreferences(
  preferences: Partial<Record<string, boolean>>,
  config: SiteConfig = siteConfig,
  now: Date = new Date(),
): StoredConsentPreferences {
  return {
    version: getConsentVersion(config),
    preferences: normalizeConsentPreferences(preferences, config),
    updatedAt: now.toISOString(),
  };
}

export function shouldRequestConsent(
  stored: Pick<StoredConsentPreferences, "version"> | null | undefined,
  config: SiteConfig = siteConfig,
) {
  if (!requiresConsentBanner(config)) return false;
  if (!stored) return true;
  return stored.version !== getConsentVersion(config);
}
