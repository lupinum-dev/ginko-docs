<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  src?: string;
  alt?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt ?? ''"
    :title="title"
    :width="width"
    :height="height"
    loading="lazy"
    decoding="async"
    :class="cn('content-prose-image', props.class)"
  />
</template>
