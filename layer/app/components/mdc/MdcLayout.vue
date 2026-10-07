<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "../../utils";

type ValueProp<T extends string> = T | { value?: T | string };
type LayoutType = "default" | "card" | "border" | "border-dashed" | "outline" | "outline-dashed";

const props = withDefaults(
  defineProps<{
    type?: ValueProp<LayoutType>;
    align?: "start" | "center" | "end";
    gap?: "none" | "sm" | "md" | "lg";
    stack?: "sm" | "md" | "lg";
    surface?: "default" | "muted" | "tint";
    class?: HTMLAttributes["class"];
  }>(),
  { type: "default", align: "start", gap: "md", stack: "md", surface: "default" },
);

const layoutType = computed(() =>
  typeof props.type === "string" ? props.type : (props.type?.value ?? "default"),
);
</script>

<template>
  <div :class="cn('content-layout', props.class)">
    <div
      class="content-layout-row"
      :data-type="layoutType"
      :data-align="align"
      :data-gap="gap"
      :data-stack="stack"
      :data-surface="surface"
    >
      <slot />
    </div>
  </div>
</template>
