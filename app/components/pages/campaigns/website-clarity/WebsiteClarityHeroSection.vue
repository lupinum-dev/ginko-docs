<script setup lang="ts">
import { useI18n } from "#imports";
import { campaigns } from "@/features/campaign-context/campaign-context";
import { useTracking } from "@/composables/useTracking";

const { t } = useI18n();
const { trackCampaign } = useTracking();
const campaign = campaigns["website-clarity"];

function trackPrimaryCta() {
  trackCampaign("campaign_primary_cta", campaign.campaignKey, campaign.offerKey, "campaign_hero");
}
</script>

<template>
  <section class="overflow-hidden border-b border-border">
    <div
      class="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[1fr_22rem] lg:items-end"
    >
      <div class="max-w-3xl">
        <p class="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
          {{ t("pages.campaign.hero.eyebrow") }}
        </p>
        <h1
          class="mt-5 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl"
        >
          {{ t("pages.campaign.hero.headline") }}
        </h1>
        <p class="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          {{ t("pages.campaign.hero.subline") }}
        </p>
        <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#clarity-call"
            class="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 font-semibold text-primary-foreground"
            @click="trackPrimaryCta"
          >
            {{ t("pages.campaign.hero.primary") }}
            <Icon name="lucide:arrow-down" class="ml-2 size-4" aria-hidden="true" />
          </a>
          <a
            href="#outcomes"
            class="inline-flex h-12 items-center justify-center rounded-md border border-border px-6 font-semibold text-foreground hover:bg-muted"
          >
            {{ t("pages.campaign.hero.secondary") }}
          </a>
        </div>
      </div>

      <aside class="border-l-2 border-primary pl-6">
        <p class="text-sm leading-6 text-muted-foreground">{{ t("pages.campaign.hero.note") }}</p>
        <p class="mt-5 text-sm font-semibold text-foreground">Lupinum OG · Niederösterreich</p>
      </aside>
    </div>
  </section>
</template>
