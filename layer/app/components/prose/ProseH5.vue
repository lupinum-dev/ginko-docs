<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  id?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h5 :id="id" :class="cn('scroll-mt-[var(--content-scroll-margin)]', props.class)">
    <slot />
  </h5>
</template>
