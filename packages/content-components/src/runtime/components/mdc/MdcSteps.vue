<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, provide } from "vue";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    variant?: "icons" | "numbered";
    class?: HTMLAttributes["class"];
  }>(),
  {
    variant: "icons",
  },
);

const normalizedVariant = computed(() => (props.variant === "numbered" ? "numbered" : "icons"));

provide("mdcStepsVariant", normalizedVariant);
</script>

<template>
  <div :class="cn('content-steps not-prose', props.class)" :data-variant="normalizedVariant">
    <slot />
  </div>
</template>
