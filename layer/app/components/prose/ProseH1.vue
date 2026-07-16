<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  id?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h1 :id="id" :class="cn('scroll-mt-28', props.class)">
    <a v-if="id" :href="`#${id}`" class="inline-flex items-center gap-2">
      <slot />
    </a>
    <slot v-else />
  </h1>
</template>
