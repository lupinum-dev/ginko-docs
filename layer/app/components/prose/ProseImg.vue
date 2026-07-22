<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Motion } from "motion-v";
import { computed } from "vue";
import { useI18n } from "#imports";
import ImageZoomDialog from "#ginko-docs/components/content/ImageZoomDialog.vue";
import { useGinkoDocsConfig } from "#ginko-docs/composables/useGinkoDocsConfig";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    title?: string;
    caption?: string;
    description?: string;
    width?: string | number;
    height?: string | number;
    bleed?: boolean | string;
    aspect?: "auto" | "video" | "wide" | "square" | "portrait";
    fit?: "cover" | "contain";
    align?: "left" | "center" | "right";
    class?: HTMLAttributes["class"];
  }>(),
  {
    aspect: "auto",
    fit: "cover",
    align: "center",
  },
);

const { t } = useI18n();
const config = useGinkoDocsConfig();
const zoomEnabled = computed(() => config.images?.zoom !== false);

const shouldBleed = computed(() => props.bleed === true || props.bleed === "true");

const aspectClass = computed(() => {
  return {
    auto: "",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    square: "aspect-square",
    portrait: "aspect-[4/5]",
  }[props.aspect];
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
      <ImageZoomDialog
        v-if="zoomEnabled"
        :src="src"
        :alt="alt"
        :label="caption || title"
        :description="description"
      >
        <template #trigger="{ layoutId, transition }">
          <button
            type="button"
            class="block w-full cursor-zoom-in rounded-[inherit] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            :aria-label="`${t('docs.zoomImage')}: ${alt ?? ''}`"
          >
            <Motion as-child :layout-id="layoutId" :transition="transition">
              <NuxtImg
                :src="src"
                :alt="alt"
                :width="width"
                :height="height"
                sizes="100vw md:768px"
                loading="lazy"
                :class="imageClass"
              />
            </Motion>
          </button>
        </template>
      </ImageZoomDialog>
      <NuxtImg
        v-else
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        sizes="100vw md:768px"
        loading="lazy"
        :class="imageClass"
      />
    </template>
    <figcaption
      v-if="caption || title || alt || description"
      :class="
        cn(
          align === 'left' && 'text-left',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
        )
      "
    >
      <span>{{ caption || title || alt }}</span>
      <span v-if="description" class="content-media-description">
        {{ description }}
      </span>
    </figcaption>
  </figure>
</template>
