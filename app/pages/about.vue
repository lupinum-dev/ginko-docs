<script setup lang="ts">
import { defaultOgImage } from "@/lib/seo";
import { computed } from "vue";
import { definePageMeta, useI18n, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import BusinessCtaSection from "@/components/marketing/CtaSection.vue";
import AboutHeroSection from "@/components/pages/about/AboutHeroSection.vue";
import AboutValuesSection from "@/components/pages/about/AboutValuesSection.vue";

definePageMeta({ layout: "marketing" });

const { t } = useI18n();
const localizedPath = useLocalizedPath();
useSeoMeta({
  title: computed(() => t("pages.about.title")),
  description: computed(() => t("pages.about.description")),
  ogTitle: computed(() => t("pages.about.title")),
  ogDescription: computed(() => t("pages.about.description")),
  ogImage: defaultOgImage,
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div>
    <AboutHeroSection />
    <AboutValuesSection />
    <BusinessCtaSection
      :headline="t('pages.about.ctaHeadline')"
      :subline="t('pages.about.ctaSubline')"
      :primary-cta="{ label: t('pages.about.ctaPrimary'), href: localizedPath('contact') }"
      :secondary-cta="{ label: t('pages.about.ctaSecondary'), href: localizedPath('references') }"
    />
  </div>
</template>
