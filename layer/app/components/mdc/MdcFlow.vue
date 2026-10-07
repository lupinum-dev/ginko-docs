<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    width?: "reading" | "wide";
    surface?: "default" | "muted" | "tint";
    class?: HTMLAttributes["class"];
  }>(),
  { width: "reading", surface: "default" },
);
</script>

<template>
  <div :class="cn('content-flow', props.class)" :data-surface="surface">
    <div class="content-flow-track">
      <div class="content-flow-body" :data-width="width">
        <slot />
      </div>
    </div>
  </div>
</template>
