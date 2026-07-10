<script setup lang="ts">
import { computed, onMounted } from "vue";
import { definePageMeta, useHead, useI18n, useSeoMeta } from "#imports";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";
import { useCampaignContext } from "@/features/campaign-context/useCampaignContext";
import { campaigns } from "@/features/campaign-context/campaign-context";
import { useTracking } from "@/composables/useTracking";
import WebsiteClarityHeroSection from "@/components/pages/campaigns/website-clarity/WebsiteClarityHeroSection.vue";
import WebsiteClarityOutcomesSection from "@/components/pages/campaigns/website-clarity/WebsiteClarityOutcomesSection.vue";
import WebsiteClarityProcessSection from "@/components/pages/campaigns/website-clarity/WebsiteClarityProcessSection.vue";
import WebsiteClarityFormSection from "@/components/pages/campaigns/website-clarity/WebsiteClarityFormSection.vue";

definePageMeta({ layout: "campaign" });

const { t } = useI18n();
const canonicalUrl = useCanonicalUrl();
const { activateCampaign } = useCampaignContext();
const { trackCampaign } = useTracking();
const campaign = campaigns["website-clarity"];

activateCampaign(campaign.campaignKey);
onMounted(() => {
  trackCampaign("campaign_view", campaign.campaignKey, campaign.offerKey, "campaign_page");
});

useSeoMeta({
  title: computed(() => t("pages.campaign.title")),
  description: computed(() => t("pages.campaign.description")),
  ogTitle: computed(() => t("pages.campaign.title")),
  ogDescription: computed(() => t("pages.campaign.description")),
  ogUrl: canonicalUrl,
  robots: "noindex, nofollow",
  twitterCard: "summary_large_image",
});
useHead(() => ({
  link: [{ key: "canonical", rel: "canonical", href: canonicalUrl.value }],
}));
</script>

<template>
  <WebsiteClarityHeroSection />
  <WebsiteClarityOutcomesSection />
  <WebsiteClarityProcessSection />
  <WebsiteClarityFormSection />
</template>
