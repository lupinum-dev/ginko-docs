import { siteConfig } from "../site.config";
import type { SiteConfig } from "../config/site.schema";
import {
  getServiceRegistry,
  type ServiceCategory,
  type ServiceEntry,
} from "../config/service-registry";
import type { TrackingEvent, TrackingProps } from "./tracking/events";

export const scriptBackedServiceIds = [
  "analytics.plausible",
  "analytics.ga4",
  "analytics.gtm",
] as const;

export type ScriptBackedServiceId = (typeof scriptBackedServiceIds)[number];

export interface ServiceScriptState {
  id: ScriptBackedServiceId;
  category: ServiceCategory;
  enabled: boolean;
  consented: boolean;
  loadable: boolean;
}

function isScriptBackedService(
  service: ServiceEntry,
): service is ServiceEntry & { id: ScriptBackedServiceId } {
  return scriptBackedServiceIds.some((id) => id === service.id);
}

export interface PlausibleTrackingEvent {
  name: TrackingEvent["name"];
  options: {
    props: TrackingProps;
  };
}

export type GoogleConsentCategoryValue = "denied" | "granted";

export interface GoogleConsentState {
  ad_personalization: GoogleConsentCategoryValue;
  ad_storage: GoogleConsentCategoryValue;
  ad_user_data: GoogleConsentCategoryValue;
  analytics_storage: GoogleConsentCategoryValue;
}

export const googleConsentDenied: GoogleConsentState = {
  ad_personalization: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  analytics_storage: "denied",
};

function hasCategoryConsent(
  preferences: Partial<Record<ServiceCategory, boolean>>,
  category: ServiceCategory,
) {
  return category === "essential" || Boolean(preferences[category]);
}

export function getGoogleConsentState(
  preferences: Partial<Record<ServiceCategory, boolean>>,
): GoogleConsentState {
  const analytics: GoogleConsentCategoryValue = hasCategoryConsent(preferences, "analytics")
    ? "granted"
    : "denied";
  const marketing: GoogleConsentCategoryValue = hasCategoryConsent(preferences, "marketing")
    ? "granted"
    : "denied";

  return {
    ad_personalization: marketing,
    ad_storage: marketing,
    ad_user_data: marketing,
    analytics_storage: analytics,
  };
}

export function getServiceScriptStates(
  preferences: Partial<Record<ServiceCategory, boolean>>,
  config: SiteConfig = siteConfig,
): ServiceScriptState[] {
  return getServiceRegistry(config)
    .filter(isScriptBackedService)
    .map((service) => {
      const enabled = service.status === "enabled";
      const consented = hasCategoryConsent(preferences, service.category);

      return {
        id: service.id,
        category: service.category,
        enabled,
        consented,
        loadable: enabled && consented,
      };
    });
}

export function isServiceScriptLoadable(
  id: ScriptBackedServiceId,
  preferences: Partial<Record<ServiceCategory, boolean>>,
  config: SiteConfig = siteConfig,
) {
  return (
    getServiceScriptStates(preferences, config).find((service) => service.id === id)?.loadable ??
    false
  );
}

export function mapTrackingEventToPlausible(event: TrackingEvent): PlausibleTrackingEvent {
  return {
    name: event.name,
    options: {
      props: event.props,
    },
  };
}
