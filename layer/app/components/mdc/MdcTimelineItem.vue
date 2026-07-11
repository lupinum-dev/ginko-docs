<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  date?: string;
  label?: string;
  title?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="cn('relative pb-8 last:pb-0', props.class)">
    <div
      class="absolute top-0.5 -left-[2.45rem] flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background"
    >
      <div class="size-2 rounded-full bg-primary" />
    </div>
    <div class="mb-2 flex flex-wrap items-center gap-2">
      <span
        v-if="date"
        class="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground"
      >
        {{ date }}
      </span>
      <span
        v-if="label"
        class="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
      >
        {{ label }}
      </span>
    </div>
    <p v-if="title" class="mb-1 font-semibold text-foreground">
      {{ title }}
    </p>
    <div
      :class="
        cn(
          'content-prose content-prose-trim text-muted-foreground',
          '[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4',
          '[&_p]:my-2 [&_p]:text-pretty [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
        )
      "
    >
      <slot />
    </div>
  </div>
</template>
