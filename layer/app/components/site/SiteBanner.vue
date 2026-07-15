<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed, ref, onMounted } from "vue";
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
</script>

<template>
  <div
    v-if="visible"
    role="region"
    :aria-label="banner.text"
    class="relative z-30 bg-primary px-10 py-2.5 text-center text-sm leading-5 font-medium text-primary-foreground"
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
      class="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded p-1 opacity-70 transition-opacity hover:opacity-100"
      :aria-label="t('banner.dismiss')"
      @click="dismissed = true"
    >
      <Icon name="lucide:x" class="size-3.5" aria-hidden="true" />
    </button>
  </div>
</template>
