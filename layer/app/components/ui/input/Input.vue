<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "#ginko-docs/lib/utils";

const model = defineModel<string | number>();

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <input
    v-model="model"
    data-slot="input"
    :class="
      cn(
        'min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        props.class,
      )
    "
  />
</template>
