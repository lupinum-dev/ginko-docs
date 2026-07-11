<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "#ginko-docs/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <label data-slot="label" :class="cn('text-sm font-medium text-foreground', props.class)">
    <slot />
  </label>
</template>
