<script setup lang="ts">
import { computed } from "vue";
import { definePageMeta, useI18n, useSeoMeta } from "#imports";
import { defaultOgImage } from "@/lib/seo";
import HomeAboutSection from "@/components/pages/home/HomeAboutSection.vue";
import HomeCtaSection from "@/components/pages/home/HomeCtaSection.vue";
import HomeFaqSection from "@/components/pages/home/HomeFaqSection.vue";
import HomeHeroSection from "@/components/pages/home/HomeHeroSection.vue";
import HomeOffersSection from "@/components/pages/home/HomeOffersSection.vue";
import HomeProblemSection from "@/components/pages/home/HomeProblemSection.vue";
import HomeProofStripSection from "@/components/pages/home/HomeProofStripSection.vue";
import HomeProjectsSection from "@/components/pages/home/HomeProjectsSection.vue";
import HomeSolutionSection from "@/components/pages/home/HomeSolutionSection.vue";

definePageMeta({ layout: "marketing" });

const { t } = useI18n();

useSeoMeta({
  title: computed(() => t("pages.home.title")),
  description: computed(() => t("pages.home.description")),
  ogTitle: computed(() => t("pages.home.ogTitle")),
  ogDescription: computed(() => t("pages.home.ogDescription")),
  ogImage: defaultOgImage,
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div
    class="bg-hero-bg font-sans text-gray-900 selection:bg-hero-yellow selection:text-gray-900 dark:text-hero-white"
  >
    <HomeHeroSection />
    <HomeProofStripSection />
    <HomeProblemSection />
    <HomeSolutionSection />
    <HomeProjectsSection />
    <HomeOffersSection />
    <HomeAboutSection />
    <HomeFaqSection />
    <HomeCtaSection />
  </div>
</template>
