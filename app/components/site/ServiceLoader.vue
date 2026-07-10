<script setup lang="ts">
import { siteConfig } from "@/site.config";
import {
  getGoogleConsentState,
  googleConsentDenied,
  isServiceScriptLoadable,
  mapTrackingEventToPlausible,
} from "@/lib/service-scripts";
import { registerTrackingProvider } from "@/lib/tracking/dispatch";
import { computed, onMounted, onUnmounted, watch } from "vue";
import {
  useScriptGoogleAnalytics,
  useScriptGoogleTagManager,
  useScriptPlausibleAnalytics,
  useScriptTriggerConsent,
} from "#imports";
import { useCookieConsent } from "@/composables/useCookieConsent";

const { preferences } = useCookieConsent();

const canLoadPlausible = computed(() =>
  isServiceScriptLoadable("analytics.plausible", preferences.value),
);
const canLoadGa4 = computed(() => isServiceScriptLoadable("analytics.ga4", preferences.value));
const canLoadGtm = computed(() => isServiceScriptLoadable("analytics.gtm", preferences.value));

const plausibleScript = siteConfig.analytics.plausible.enabled
  ? useScriptPlausibleAnalytics({
      domain: siteConfig.analytics.plausible.domain,
      scriptOptions: {
        bundle: false,
        proxy: false,
        trigger: useScriptTriggerConsent({ consent: canLoadPlausible }),
      },
      trackForms: false,
    })
  : null;

const ga4Script = siteConfig.analytics.ga4.enabled
  ? useScriptGoogleAnalytics({
      defaultConsent: googleConsentDenied,
      id: siteConfig.analytics.ga4.id,
      scriptOptions: {
        bundle: false,
        proxy: false,
        trigger: useScriptTriggerConsent({ consent: canLoadGa4 }),
      },
    })
  : null;

const gtmScript = siteConfig.analytics.gtm.enabled
  ? useScriptGoogleTagManager({
      defaultConsent: googleConsentDenied,
      id: siteConfig.analytics.gtm.id,
      scriptOptions: {
        bundle: false,
        proxy: false,
        trigger: useScriptTriggerConsent({ consent: canLoadGtm }),
      },
    })
  : null;

watch(
  preferences,
  (value) => {
    const googleConsent = getGoogleConsentState(value);
    ga4Script?.consent?.update(googleConsent);
    gtmScript?.consent?.update(googleConsent);
  },
  { deep: true, immediate: true },
);

let unregisterTrackingProvider: (() => void) | undefined;

onMounted(() => {
  unregisterTrackingProvider = registerTrackingProvider((event) => {
    if (plausibleScript && canLoadPlausible.value) {
      const plausibleEvent = mapTrackingEventToPlausible(event);
      plausibleScript.proxy.plausible(plausibleEvent.name, plausibleEvent.options);
    }

    if (ga4Script && canLoadGa4.value) {
      ga4Script.proxy.gtag("event", event.name, event.props);
    }

    if (gtmScript && canLoadGtm.value) {
      gtmScript.proxy.dataLayer.push({
        event: event.name,
        ...event.props,
      });
    }
  });
});

onUnmounted(() => {
  unregisterTrackingProvider?.();
});
</script>

<template></template>
