<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  href?: string;
  target?: string;
  class?: HTMLAttributes["class"];
}>();

const isExternal = computed(
  () => props.target === "_blank" || (props.href && /^https?:\/\//.test(props.href)),
);
</script>

<template>
  <NuxtLink :href="props.href || ''" :target="props.target" :class="cn(props.class)">
    <slot />
    <Icon
      v-if="isExternal"
      name="lucide:arrow-up-right"
      class="ml-0.5 inline size-3 align-text-top"
      aria-hidden="true"
    />
  </NuxtLink>
</template>
