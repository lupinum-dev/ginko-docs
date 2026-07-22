<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";
import { useProseAppearance } from "../../composables/useProseAppearance";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  appearance?: "quiet" | "tint";
}>();
const appearance = useProseAppearance("timeline", () => props.appearance);
</script>

<template>
  <div :class="cn('content-timeline not-prose', props.class)" :data-appearance="appearance">
    <slot />
  </div>
</template>
