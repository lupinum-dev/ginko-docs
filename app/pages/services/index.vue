<script setup lang="ts">
import { computed } from "vue";
import { definePageMeta, useContentMany, useHead, useI18n, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";
import BusinessSectionHeader from "@/components/marketing/SectionHeader.vue";
import BusinessServiceCard from "@/components/marketing/ServiceCard.vue";
import BusinessCtaSection from "@/components/marketing/CtaSection.vue";

definePageMeta({ layout: "marketing" });

const { locale, t } = useI18n();
const localizedPath = useLocalizedPath();
const { data: services } = await useContentMany("services", {
  locale: () => locale.value,
  fallback: true,
  sort: { order: "asc" },
  limit: 20,
});
const canonicalUrl = useCanonicalUrl();

useSeoMeta({
  title: computed(() => t("pages.services.title")),
  description: computed(() => t("pages.services.description")),
  ogTitle: computed(() => t("pages.services.title")),
  ogDescription: computed(() => t("pages.services.description")),
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
});

useHead(() => ({
  link: [{ key: "canonical", rel: "canonical", href: canonicalUrl.value }],
}));
</script>

<template>
  <div>
    <section class="site-section-hero border-b border-border">
      <div class="site-container">
        <BusinessSectionHeader
          :eyebrow="t('pages.services.eyebrow')"
          :headline="t('pages.services.headline')"
          :heading-level="1"
          :subline="t('pages.services.subline')"
        />
      </div>
    </section>

    <section class="site-section">
      <div class="site-container">
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <BusinessServiceCard
            v-for="service in services"
            :key="service.path"
            :title="service.title"
            :description="service.description"
            :href="service.path"
            :icon="service.icon"
            :outcome="service.outcome"
            :cta-label="t('pages.services.readMore')"
            :heading-level="2"
          />
        </div>
      </div>
    </section>

    <BusinessCtaSection
      :headline="t('pages.services.ctaHeadline')"
      :subline="t('pages.services.ctaSubline')"
      :primary-cta="{ label: t('pages.services.ctaPrimary'), href: localizedPath('contact') }"
      :secondary-cta="{
        label: t('pages.services.ctaSecondary'),
        href: localizedPath('references'),
      }"
    />
  </div>
</template>
