<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
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
</script>

<template>
  <figure
    :class="cn('content-media not-prose', props.class)"
    :data-bleed="shouldBleed ? 'true' : undefined"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :class="cn('w-full', aspectClass, fit === 'contain' ? 'object-contain' : 'object-cover')"
    />
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
