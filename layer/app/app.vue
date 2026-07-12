<script setup lang="ts">
import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";
import { defaultOgImage } from "#ginko-docs/lib/seo";
import { useAppConfig, useHead, useI18n, useRoute, useSeoMeta } from "#imports";
import { useLocalizedRouteSwitch } from "#ginko-docs/composables/useLocalizedRouteSwitch";
import { useCanonicalUrl } from "#ginko-docs/composables/useCanonicalUrl";
import { useSchemaJsonLd } from "#ginko-docs/composables/useSchemaJsonLd";
import { defaultLocale } from "../i18n/locales";

const canonicalUrl = useCanonicalUrl();
const { locale, locales } = useI18n();
const route = useRoute();
const { switchPathname } = useLocalizedRouteSwitch();
const docsConfig = useAppConfig().ginkoDocs;
const siteUrl = docsConfig.site.url;

useSeoMeta({
  ogImage: defaultOgImage,
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
  twitterImage: defaultOgImage,
});

useSchemaJsonLd(() => [
  {
    "@type": "WebSite",
    name: getLocalizedSiteText(docsConfig.site.name, locale.value),
    description: getLocalizedSiteText(docsConfig.site.description, locale.value),
    url: siteUrl,
    inLanguage: locale.value,
  },
]);

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
  link: [
    { key: "canonical", rel: "canonical", href: canonicalUrl.value },
    ...locales.value.map((entry) => {
      const code = typeof entry === "string" ? entry : entry.code;
      const language = typeof entry === "string" ? entry : (entry.language ?? entry.code);
      return {
        key: `alternate-${code}`,
        rel: "alternate",
        hreflang: language,
        href: new URL(switchPathname(code) || route.path, siteUrl).toString(),
      };
    }),
    {
      key: "alternate-x-default",
      rel: "alternate",
      hreflang: "x-default",
      href: new URL(switchPathname(defaultLocale) || route.path, siteUrl).toString(),
    },
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
</template>
