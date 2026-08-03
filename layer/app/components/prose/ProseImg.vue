<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, resolveComponent } from "vue";
import { Motion } from "motion-v";
import { useI18n } from "#imports";
import ImageZoomDialog from "#ginko-docs/components/content/ImageZoomDialog.vue";
import { useGinkoDocsConfig } from "#ginko-docs/composables/useGinkoDocsConfig";
import { cn } from "../../utils";

const props = defineProps<{
  src?: string;
  alt?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  class?: HTMLAttributes["class"];
}>();

const { t } = useI18n();
const config = useGinkoDocsConfig();
const zoomEnabled = computed(() => config.images?.zoom !== false);

// External images skip NuxtImg; the layer ships no ipx domain allowlist.
const isLocalAsset = computed(() => Boolean(props.src?.startsWith("/")));
const imageComponent = computed(() => (isLocalAsset.value ? resolveComponent("NuxtImg") : "img"));
const imageAttrs = computed(() => ({
  src: props.src,
  alt: props.alt ?? "",
  title: props.title,
  width: props.width,
  height: props.height,
  loading: "lazy" as const,
  decoding: "async" as const,
  class: cn("content-prose-image", props.class),
  ...(isLocalAsset.value ? { sizes: "100vw md:704px" } : {}),
}));
</script>

<template>
  <ImageZoomDialog v-if="src && zoomEnabled" :src="src" :alt="alt" :label="title">
    <template #trigger="{ layoutId, transition }">
      <!-- A button is phrasing content, so a bare markdown image stays valid inside its paragraph. -->
      <button
        type="button"
        class="block max-w-full cursor-zoom-in rounded-[var(--radius)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        :aria-label="`${t('docs.zoomImage')}: ${alt ?? ''}`"
      >
        <Motion as-child :layout-id="layoutId" :transition="transition">
          <component :is="imageComponent" v-bind="imageAttrs" />
        </Motion>
      </button>
    </template>
  </ImageZoomDialog>
  <component :is="imageComponent" v-else-if="src" v-bind="imageAttrs" />
</template>
