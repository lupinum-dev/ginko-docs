<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    :class="
      cn(
        'content-files not-prose my-4 rounded-xl border bg-card p-1.5 text-sm text-card-foreground shadow-xs',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
