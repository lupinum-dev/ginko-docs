<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "#imports";
import { useSiteNavigation } from "@/composables/useSiteNavigation";

const { banner } = useSiteNavigation();
const { t } = useI18n();
const dismissed = ref(false);
</script>

<template>
  <div
    v-if="banner.show && !dismissed"
    role="region"
    :aria-label="banner.text"
    class="relative z-30 bg-primary px-10 py-2.5 text-center text-sm leading-5 font-medium text-primary-foreground"
  >
    <span class="mx-auto block max-w-[min(100%,52rem)]">
      {{ banner.text }}
      <NuxtLink
        :to="banner.linkHref"
        class="ml-1.5 inline-block underline underline-offset-2 opacity-90 transition-opacity hover:opacity-100"
      >
        {{ banner.linkLabel }}
      </NuxtLink>
    </span>
    <button
      class="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
      :aria-label="t('banner.dismiss')"
      @click="dismissed = true"
    >
      <Icon name="lucide:x" class="size-3.5" aria-hidden="true" />
    </button>
  </div>
</template>
