<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  /** Short label above the block (e.g. excerpt, chapter). */
  label?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <aside class="not-prose my-4">
    <div
      data-slot="card"
      :class="
        cn(
          'content-prose content-prose-trim gap-0 rounded-xl border border-border bg-muted/40 px-4 py-3 text-muted-foreground shadow-xs',
          props.class,
        )
      "
    >
      <p
        v-if="label"
        class="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase"
      >
        {{ label }}
      </p>
      <slot />
    </div>
  </aside>
</template>
