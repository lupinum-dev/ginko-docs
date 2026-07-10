<script setup lang="ts">
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useTracking } from "@/composables/useTracking";
import SiteLogoMark from "@/components/site/SiteLogoMark.vue";
import SiteLocaleSwitcher from "@/components/site/SiteLocaleSwitcher.vue";
import { campaigns } from "@/features/campaign-context/campaign-context";
import { siteConfig } from "@/site.config";
import { useCookieConsentUi } from "@/components/site/cookie/useCookieConsentUi";

const { t } = useI18n();
const localizedPath = useLocalizedPath();
const { trackCampaign } = useTracking();
const { openCookieSettings } = useCookieConsentUi();
const campaign = campaigns["website-clarity"];

function trackExplore(location: string) {
  trackCampaign("campaign_explore_site", campaign.campaignKey, campaign.offerKey, location);
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/15">
    <header class="border-b border-border bg-background/95 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-6">
        <NuxtLink
          :to="{ path: localizedPath('home'), query: { from: campaign.campaignKey } }"
          class="flex items-center gap-2"
          @click="trackExplore('campaign_header_logo')"
        >
          <SiteLogoMark />
          <span class="sr-only">{{ siteConfig.identity.brandName }}</span>
        </NuxtLink>
        <div class="ml-auto flex items-center gap-2 sm:gap-4">
          <NuxtLink
            :to="{ path: localizedPath('home'), query: { from: campaign.campaignKey } }"
            class="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
            @click="trackExplore('campaign_header')"
          >
            {{ t("pages.campaign.header.explore") }}
          </NuxtLink>
          <SiteLocaleSwitcher />
          <a
            href="#clarity-call"
            class="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground sm:px-4"
          >
            {{ t("pages.campaign.header.cta") }}
          </a>
        </div>
      </div>
    </header>

    <main id="main-content" class="flex-1"><slot /></main>

    <footer class="border-t border-border bg-muted/25">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6"
      >
        <p>{{ t("pages.campaign.footer.identity") }}</p>
        <nav class="flex flex-wrap gap-x-5 gap-y-2" :aria-label="t('nav.company')">
          <NuxtLink :to="localizedPath('privacy')" class="hover:text-foreground">{{
            t("nav.privacy")
          }}</NuxtLink>
          <NuxtLink :to="localizedPath('imprint')" class="hover:text-foreground">{{
            t("nav.imprint")
          }}</NuxtLink>
          <button type="button" class="hover:text-foreground" @click="openCookieSettings">
            {{ t("cookie.settingsLink") }}
          </button>
          <NuxtLink
            :to="{ path: localizedPath('home'), query: { from: campaign.campaignKey } }"
            class="font-medium text-foreground"
            @click="trackExplore('campaign_footer')"
          >
            {{ t("pages.campaign.footer.fullSite") }}
          </NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>
