<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { cn } from "../../utils";

const props = defineProps<{
  label?: string;
  appearance?: "quiet" | "tint";
  class?: HTMLAttributes["class"];
}>();
const appearance = useProseAppearance("aside", () => props.appearance);
</script>

<template>
  <aside :data-appearance="appearance" :class="cn('content-aside not-prose', props.class)">
    <p v-if="label" class="content-aside-label">
      {{ label }}
    </p>
    <div class="content-aside-body content-prose content-prose-trim">
      <slot />
    </div>
  </aside>
</template>
