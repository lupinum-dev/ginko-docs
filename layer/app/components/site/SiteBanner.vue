<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "#imports";
import { useGinkoDocsConfig } from "#ginko-docs/composables/useGinkoDocsConfig";
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";

const props = defineProps<{
  landing?: boolean;
}>();

const { banner } = useSiteNavigation();
const { t } = useI18n();
const config = useGinkoDocsConfig();

const dismissed = useLocalStorage(banner.value.storageKey, false);
// Avoid a hydration mismatch: localStorage is client-only, so reveal after mount.
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});
const visible = computed(
  () =>
    banner.value.show &&
    (!props.landing || config.banner.showOnLanding) &&
    (!hydrated.value ? true : !dismissed.value),
);

// The banner scrolls away above the sticky header, so sticky consumers
// (docs sidebar/TOC heights, mobile menu top) need its *currently visible*
// height. This component is the single writer of --site-banner-height.
const bannerElement = ref<HTMLElement | null>(null);
let rafId: number | null = null;
let lastHeight = -1;

function updateBannerHeightVar() {
  rafId = null;
  const element = bannerElement.value;
  const height = element
    ? Math.max(0, Math.min(element.getBoundingClientRect().bottom, element.offsetHeight))
    : 0;
  if (height === lastHeight) return;
  lastHeight = height;
  document.documentElement.style.setProperty("--site-banner-height", `${height}px`);
}

function scheduleBannerHeightVar() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(updateBannerHeightVar);
}

watch(visible, () => {
  void nextTick(scheduleBannerHeightVar);
});

onMounted(() => {
  window.addEventListener("scroll", scheduleBannerHeightVar, { passive: true });
  window.addEventListener("resize", scheduleBannerHeightVar, { passive: true });
  scheduleBannerHeightVar();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleBannerHeightVar);
  window.removeEventListener("resize", scheduleBannerHeightVar);
  if (rafId !== null) cancelAnimationFrame(rafId);
  document.documentElement.style.setProperty("--site-banner-height", "0px");
});
</script>

<template>
  <div
    v-if="visible"
    ref="bannerElement"
    role="region"
    :aria-label="banner.text"
    class="relative z-30 bg-brand px-10 py-2.5 text-center text-sm leading-5 font-medium text-brand-foreground"
  >
    <span class="mx-auto block max-w-[min(100%,52rem)]">
      {{ banner.text }}
      <NuxtLink
        v-if="banner.linkHref"
        :to="banner.linkHref"
        class="ml-1.5 inline-block underline underline-offset-2 opacity-90 transition-opacity hover:opacity-100"
      >
        {{ banner.linkLabel }}
      </NuxtLink>
    </span>
    <button
      type="button"
      class="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-foreground/50 focus-visible:outline-none"
      :aria-label="t('banner.dismiss')"
      @click="dismissed = true"
    >
      <Icon name="lucide:x" class="size-3.5" aria-hidden="true" />
    </button>
  </div>
</template>
