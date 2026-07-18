<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, provide } from "vue";
import { cn } from "../../utils";
import { filesHighlightKey, filesParentPathKey } from "./files-context";

const props = defineProps<{
  /** Path of the file or folder to highlight, e.g. "app/app.config.ts". */
  highlight?: string;
  class?: HTMLAttributes["class"];
}>();

provide(
  filesHighlightKey,
  computed(() => props.highlight || undefined),
);
provide(
  filesParentPathKey,
  computed(() => ""),
);
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
