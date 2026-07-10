<script setup lang="ts">
import { createBusinessIdentitySchema, createWebSiteSchema } from "@/lib/schema-org";
import { defaultOgImage } from "@/lib/seo";
import { siteConfig } from "@/site.config";
import { useHead, useI18n, useRoute, useSeoMeta } from "#imports";
import { useLocalizedRouteSwitch } from "@/composables/useLocalizedRouteSwitch";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";
import { useSchemaJsonLd } from "@/composables/useSchemaJsonLd";
import { locales } from "../i18n/locales";
import SiteServiceLoader from "@/components/site/ServiceLoader.vue";
import CookieConsentManager from "@/components/site/cookie/CookieConsentManager.vue";

const canonicalUrl = useCanonicalUrl();
const { locale } = useI18n();
const route = useRoute();
const { switchPath } = useLocalizedRouteSwitch();
const siteUrl = siteConfig.site.url;

useSeoMeta({
  ogImage: defaultOgImage,
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
  twitterImage: defaultOgImage,
});

useSchemaJsonLd(() => [
  createBusinessIdentitySchema(locale.value),
  createWebSiteSchema(locale.value),
]);

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
  link: [
    { key: "canonical", rel: "canonical", href: canonicalUrl.value },
    ...locales.map((entry) => ({
      key: `alternate-${entry.code}`,
      rel: "alternate",
      hreflang: entry.language,
      href: new URL(switchPath(entry.code) || route.path, siteUrl).toString(),
    })),
  ],
}));
</script>

<template>
  <div role="region" aria-label="Route announcements" aria-live="polite" class="sr-only">
    <NuxtRouteAnnouncer />
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <SiteServiceLoader />
    <CookieConsentManager />
  </ClientOnly>
</template>
