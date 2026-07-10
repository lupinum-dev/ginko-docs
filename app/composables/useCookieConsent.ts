import { useLocalStorage } from "@vueuse/core";
import { siteConfig } from "@/site.config";
import type { ServiceCategory } from "@/config/service-registry";
import { computed, ref, watch } from "vue";
import { useTracking } from "@/composables/useTracking";
import {
  createAcceptedConsentPreferences,
  createDefaultConsentPreferences,
  createStoredConsentPreferences,
  getConsentCategories,
  getConsentVersion,
  normalizeConsentPreferences,
  shouldRequestConsent,
  type ConsentPreferences,
  type StoredConsentPreferences,
} from "@/lib/consent";

const COOKIE_CONSENT_STORAGE_KEY = "site-cookie-consent";

export function useCookieConsent() {
  const stored = useLocalStorage<StoredConsentPreferences | null>(COOKIE_CONSENT_STORAGE_KEY, null);
  const { trackCookiePreferences } = useTracking();
  const categories = computed(() => getConsentCategories(siteConfig));
  const version = computed(() => getConsentVersion(siteConfig));
  const preferences = ref<ConsentPreferences>(createDefaultConsentPreferences(siteConfig));

  watch(
    stored,
    (value) => {
      preferences.value = normalizeConsentPreferences(value?.preferences, siteConfig);
    },
    { deep: true, immediate: true },
  );

  const needsConsent = computed(() => shouldRequestConsent(stored.value, siteConfig));

  function persist(input: Partial<Record<string, boolean>>) {
    const next = createStoredConsentPreferences(input, siteConfig);
    stored.value = next;
    preferences.value = next.preferences;
    trackCookiePreferences(true);
    return next;
  }

  function acceptAll() {
    return persist(createAcceptedConsentPreferences(siteConfig));
  }

  function rejectOptional() {
    return persist(createDefaultConsentPreferences(siteConfig));
  }

  function savePreferences(input: Partial<Record<string, boolean>>) {
    return persist(input);
  }

  function hasConsent(category: ServiceCategory) {
    return Boolean(normalizeConsentPreferences(stored.value?.preferences, siteConfig)[category]);
  }

  return {
    acceptAll,
    categories,
    hasConsent,
    needsConsent,
    preferences,
    rejectOptional,
    savePreferences,
    stored,
    version,
  };
}
