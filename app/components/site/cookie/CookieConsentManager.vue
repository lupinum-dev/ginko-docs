<script setup lang="ts">
import { ref, watch } from "vue";
import CookieBanner from "@/components/site/cookie/CookieBanner.vue";
import CookieSettings from "@/components/site/cookie/CookieSettings.vue";
import { useCookieConsent } from "@/composables/useCookieConsent";
import { useCookieConsentUi } from "@/components/site/cookie/useCookieConsentUi";
import { hasConfigurableOptionalServices } from "@/config/service-registry";

const { acceptAll, needsConsent, rejectOptional } = useCookieConsent();
const { settingsOpen, openCookieSettings } = useCookieConsentUi();
const bannerOpen = ref(false);
const enabled = hasConfigurableOptionalServices();

watch(
  needsConsent,
  (value) => {
    if (value) bannerOpen.value = true;
  },
  { immediate: true },
);

function acceptCookies() {
  acceptAll();
  bannerOpen.value = false;
}

function rejectCookies() {
  rejectOptional();
  bannerOpen.value = false;
}

function manageCookies() {
  bannerOpen.value = false;
  openCookieSettings();
}
</script>

<template>
  <template v-if="enabled">
    <CookieBanner
      v-model:open="bannerOpen"
      @accept="acceptCookies"
      @reject="rejectCookies"
      @manage="manageCookies"
    />
    <CookieSettings v-model:open="settingsOpen" />
  </template>
</template>
