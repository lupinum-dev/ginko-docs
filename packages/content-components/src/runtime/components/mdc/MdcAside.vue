<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  label?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <aside
    :class="
      cn(
        'not-prose my-4 rounded-lg border-l-2 border-muted-foreground/20 bg-muted/20 px-4 py-3',
        props.class,
      )
    "
  >
    <p v-if="label" class="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
      {{ label }}
    </p>
    <div :class="cn('content-prose content-prose-trim text-muted-foreground')">
      <slot />
    </div>
  </aside>
</template>
