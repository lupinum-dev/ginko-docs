<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, ref } from "vue";
import { useI18n } from "#imports";
import ImageZoomDialog from "#ginko-docs/components/content/ImageZoomDialog.vue";
import { useGinkoDocsConfig } from "#ginko-docs/composables/useGinkoDocsConfig";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    caption?: string;
    width?: string | number;
    height?: string | number;
    bleed?: boolean | string;
    aspect?: "auto" | "video" | "wide" | "square" | "portrait";
    fit?: "cover" | "contain";
    zoom?: boolean | string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    // Vue casts an absent Boolean-typed prop to false; "auto" preserves the
    // site-wide images.zoom default unless the author overrides it.
    zoom: "auto",
  },
);

const { t } = useI18n();
const config = useGinkoDocsConfig();
const zoomEnabled = computed(() => {
  if (props.zoom === "auto") return config.images?.zoom !== false;
  return props.zoom === true || props.zoom === "true";
});
const zoomOpen = ref(false);

const shouldBleed = computed(
  () => props.bleed === true || props.bleed === "true" || props.bleed === "outside",
);

const aspectClass = computed(() => {
  return {
    auto: "",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    square: "aspect-square",
    portrait: "aspect-[4/5]",
  }[props.aspect ?? "auto"];
});

const imageClass = computed(() =>
  cn("w-full", aspectClass.value, props.fit === "contain" ? "object-contain" : "object-cover"),
);
</script>

<template>
  <figure
    :class="cn('content-media not-prose', props.class)"
    :data-bleed="shouldBleed ? 'true' : undefined"
  >
    <template v-if="src">
      <button
        v-if="zoomEnabled"
        type="button"
        class="block w-full cursor-zoom-in rounded-[inherit] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        :aria-label="`${t('docs.zoomImage')}: ${alt ?? ''}`"
        @click="zoomOpen = true"
      >
        <img :src="src" :alt="alt" :width="width" :height="height" :class="imageClass" />
      </button>
      <img v-else :src="src" :alt="alt" :width="width" :height="height" :class="imageClass" />
    </template>
    <slot />
    <figcaption v-if="caption || alt" class="text-center">
      {{ caption || alt }}
    </figcaption>

    <ImageZoomDialog
      v-if="zoomEnabled"
      v-model:open="zoomOpen"
      :src="src"
      :alt="alt"
      :label="caption"
    />
  </figure>
</template>
