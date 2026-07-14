<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  src?: string;
  alt?: string;
  caption?: string;
  width?: string | number;
  height?: string | number;
  bleed?: boolean | string;
  aspect?: "auto" | "video" | "wide" | "square" | "portrait";
  fit?: "cover" | "contain";
  class?: HTMLAttributes["class"];
}>();

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
    <slot />
    <figcaption v-if="caption || alt" class="text-center">
      {{ caption || alt }}
    </figcaption>
  </figure>
</template>
