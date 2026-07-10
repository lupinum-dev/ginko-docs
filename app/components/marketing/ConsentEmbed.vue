<script setup lang="ts">
import type { ServiceCategory } from "@/config/service-registry";
import { computed } from "vue";
import { useI18n } from "#imports";
import { useCookieConsent } from "@/composables/useCookieConsent";
import { useTracking } from "@/composables/useTracking";
import { Button } from "@/components/ui/button";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    src?: string;
    category?: ServiceCategory;
    kind?: "calendar" | "download" | "generic" | "map" | "video";
    contentSlug?: string;
    allow?: string;
    fallbackHref?: string;
    fallbackLabel?: string;
    providerLabel?: string;
  }>(),
  {
    allow: "fullscreen; picture-in-picture",
    category: "embeds",
    contentSlug: "embed",
    kind: "generic",
  },
);

const { t } = useI18n();
const { hasConsent, savePreferences } = useCookieConsent();
const { trackDirections, trackDownload, trackOutboundLink, trackVideo } = useTracking();

const canRender = computed(() => props.category === "essential" || hasConsent(props.category));
const iframeTitle = computed(() => props.providerLabel ?? props.title);

function allowEmbed() {
  if (props.category !== "essential") {
    savePreferences({ [props.category]: true });
  }

  if (props.kind === "video") {
    trackVideo("video_start", props.contentSlug);
  }
}

function trackFallback() {
  if (!props.fallbackHref) return;

  if (props.kind === "map") {
    trackDirections(props.fallbackHref, props.fallbackLabel);
    return;
  }

  if (props.kind === "download") {
    trackDownload(props.contentSlug, props.fallbackLabel);
    return;
  }

  trackOutboundLink("consent_embed", props.fallbackHref, props.fallbackLabel);
}
</script>

<template>
  <div class="not-prose overflow-hidden rounded-lg border border-border bg-background">
    <iframe
      v-if="canRender && src"
      :src="src"
      :title="iframeTitle"
      :allow="allow"
      class="aspect-video w-full"
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
    />

    <div v-else class="space-y-4 p-5">
      <div class="flex gap-3">
        <Icon
          name="lucide:shield-check"
          class="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div>
          <h3 class="font-medium text-foreground">{{ title }}</h3>
          <p class="mt-1 text-sm leading-6 text-muted-foreground">{{ description }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row">
        <Button v-if="src" type="button" @click="allowEmbed">
          {{ t("consentEmbed.allow") }}
        </Button>
        <Button v-if="fallbackHref" as-child variant="outline">
          <a :href="fallbackHref" target="_blank" rel="noopener noreferrer" @click="trackFallback">
            {{ fallbackLabel ?? t("consentEmbed.openFallback") }}
          </a>
        </Button>
      </div>
    </div>
  </div>
</template>
