<script setup lang="ts">
import { useI18n } from "#imports";
import { useCampaignContext } from "@/features/campaign-context/useCampaignContext";
import { useTracking } from "@/composables/useTracking";

const { t } = useI18n();
const { context, clearCampaign } = useCampaignContext();
const { trackCampaign } = useTracking();

function returnToCampaign() {
  if (!context.value) return;
  trackCampaign("campaign_return", context.value.campaignKey, context.value.offerKey, "return_bar");
}

function dismiss() {
  if (context.value) {
    trackCampaign(
      "campaign_dismiss",
      context.value.campaignKey,
      context.value.offerKey,
      "return_bar",
    );
  }
  clearCampaign();
}
</script>

<template>
  <aside
    v-if="context"
    class="sticky top-[var(--site-header-height)] z-40 border-b border-primary/20 bg-primary/8 text-foreground backdrop-blur-md"
    :aria-label="t(context.returnLabelKey)"
  >
    <div class="mx-auto flex min-h-11 max-w-5xl items-center gap-3 px-4 py-2 text-sm md:px-6">
      <span class="min-w-0 flex-1 truncate font-medium">{{ t(context.returnLabelKey) }}</span>
      <NuxtLink
        :to="context.landingPath"
        class="shrink-0 font-semibold text-primary underline-offset-4 hover:underline"
        @click="returnToCampaign"
      >
        {{ t("pages.campaign.returnBar.action") }}
      </NuxtLink>
      <button
        type="button"
        class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background/70 hover:text-foreground"
        :aria-label="t('pages.campaign.returnBar.dismiss')"
        @click="dismiss"
      >
        <Icon name="lucide:x" class="size-4" aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>
