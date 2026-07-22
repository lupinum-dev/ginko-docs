<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { cn } from "../../utils";

const props = defineProps<{
  source?: string;
  appearance?: "quiet" | "tint";
  class?: HTMLAttributes["class"];
}>();

const appearance = useProseAppearance("excerpt", () => props.appearance);
</script>

<template>
  <figure :class="cn('content-excerpt not-prose', props.class)" :data-appearance="appearance">
    <blockquote class="content-excerpt-body content-prose content-prose-trim">
      <slot />
    </blockquote>
    <figcaption v-if="source" class="content-excerpt-source">{{ source }}</figcaption>
  </figure>
</template>
