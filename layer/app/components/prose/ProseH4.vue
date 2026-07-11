<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h4 :class="cn('scroll-mt-28', props.class)">
    <slot />
  </h4>
</template>
