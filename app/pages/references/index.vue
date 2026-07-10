<script setup lang="ts">
import { computed } from "vue";
import { definePageMeta, useContentMany, useHead, useI18n, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";
import BusinessSectionHeader from "@/components/marketing/SectionHeader.vue";
import BusinessCaseStudyCard from "@/components/marketing/CaseStudyCard.vue";
import BusinessCtaSection from "@/components/marketing/CtaSection.vue";

definePageMeta({ layout: "marketing" });

const { locale, t } = useI18n();
const localizedPath = useLocalizedPath();
const { data: references } = await useContentMany("references", {
  locale: () => locale.value,
  fallback: true,
  sort: { date: "desc" },
  limit: 20,
});
const canonicalUrl = useCanonicalUrl();

useSeoMeta({
  title: computed(() => t("pages.references.title")),
  description: computed(() => t("pages.references.description")),
  ogTitle: computed(() => t("pages.references.title")),
  ogDescription: computed(() => t("pages.references.description")),
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
          :eyebrow="t('pages.references.eyebrow')"
          :headline="t('pages.references.headline')"
          :heading-level="1"
          :subline="t('pages.references.subline')"
        />
      </div>
    </section>

    <section v-if="references.length" class="site-section">
      <div class="site-container">
        <div class="grid gap-6 md:grid-cols-2">
          <BusinessCaseStudyCard
            v-for="reference in references"
            :key="reference.path"
            :title="reference.title"
            :description="reference.description"
            :href="reference.path"
            :client="reference.client"
            :industry="reference.industry"
            :outcome="reference.outcome"
            :cta-label="t('pages.references.readMore')"
            :heading-level="2"
          />
        </div>
      </div>
    </section>

    <BusinessCtaSection
      :headline="t('pages.references.ctaHeadline')"
      :subline="t('pages.references.ctaSubline')"
      :primary-cta="{ label: t('pages.references.ctaPrimary'), href: localizedPath('contact') }"
      :secondary-cta="{
        label: t('pages.references.ctaSecondary'),
        href: localizedPath('services'),
      }"
    />
  </div>
</template>
