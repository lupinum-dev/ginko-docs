<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "../../utils";

type ColumnSize = "xs" | "sm" | "md" | "lg" | "xl";
const props = withDefaults(
  defineProps<{
    size?: ColumnSize | { value?: ColumnSize | string };
    align?: "start" | "center" | "end";
    media?: "natural" | "cover" | "contain";
    class?: HTMLAttributes["class"];
  }>(),
  { size: "md", media: "natural" },
);

const sizeValue = computed(() =>
  typeof props.size === "string" ? props.size : (props.size?.value ?? "md"),
);
</script>

<template>
  <div
    :class="cn('content-layout-column', props.class)"
    :data-size="sizeValue"
    :data-align="align"
    :data-media="media"
  >
    <div class="content-layout-column-inner">
      <slot />
    </div>
  </div>
</template>
