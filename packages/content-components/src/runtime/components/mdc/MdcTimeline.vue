<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="cn('not-prose mb-12 ml-4 border-l border-border pl-8', props.class)">
    <slot />
  </div>
</template>
