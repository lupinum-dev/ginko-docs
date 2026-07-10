<script setup lang="ts">
import { useI18n } from "#imports";
import ContactForm from "@/features/contact/components/ContactForm.vue";
import { campaigns } from "@/features/campaign-context/campaign-context";
import { useCampaignContext } from "@/features/campaign-context/useCampaignContext";
import { useTracking } from "@/composables/useTracking";

const { t } = useI18n();
const { clearCampaign } = useCampaignContext();
const { trackCampaign } = useTracking();
const campaign = campaigns["website-clarity"];

function handleSubmitted() {
  trackCampaign("campaign_conversion", campaign.campaignKey, campaign.offerKey, "campaign_form");
  clearCampaign();
}
</script>

<template>
  <section
    id="clarity-call"
    class="scroll-mt-8 border-t border-border bg-foreground py-20 text-background md:py-28"
  >
    <div class="mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p class="text-sm font-semibold tracking-[0.14em] text-background/75 uppercase">
          {{ t("pages.campaign.form.eyebrow") }}
        </p>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          {{ t("pages.campaign.form.headline") }}
        </h2>
        <p class="mt-5 max-w-lg text-base leading-7 text-background/70">
          {{ t("pages.campaign.form.description") }}
        </p>
      </div>
      <div class="rounded-xl bg-background p-5 text-foreground sm:p-8">
        <ContactForm
          :offer-key="campaign.offerKey"
          :submit-label="t('pages.campaign.form.submit')"
          @submitted="handleSubmitted"
        />
      </div>
    </div>
  </section>
</template>
