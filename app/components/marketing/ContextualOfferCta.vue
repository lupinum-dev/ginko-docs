<script setup lang="ts">
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useTracking } from "@/composables/useTracking";

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const { t } = useI18n();
const localizedPath = useLocalizedPath();
const { trackCta } = useTracking();
const href = localizedPath("websiteClarity");
</script>

<template>
  <aside
    class="not-prose border-y border-border bg-muted/35"
    :class="compact ? 'my-10 px-5 py-6' : 'my-14 px-6 py-8 sm:px-8'"
  >
    <p class="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
      {{ t("pages.campaign.hero.eyebrow") }}
    </p>
    <div class="mt-3 gap-6 sm:flex sm:items-end sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold tracking-tight text-foreground">
          {{ t("pages.campaign.form.headline") }}
        </h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {{ t("pages.campaign.hero.note") }}
        </p>
      </div>
      <NuxtLink
        :to="href"
        class="mt-5 inline-flex h-10 shrink-0 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground sm:mt-0"
        @click="trackCta('contextual_content', t('pages.campaign.hero.primary'), href)"
      >
        {{ t("pages.campaign.hero.primary") }}
      </NuxtLink>
    </div>
  </aside>
</template>
