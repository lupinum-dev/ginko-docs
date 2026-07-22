<script setup lang="ts">
import { computed, provide, type HTMLAttributes } from "vue";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    cols?: 1 | 2 | 3 | "1" | "2" | "3";
    appearance?: "quiet" | "tint";
    class?: HTMLAttributes["class"];
  }>(),
  { cols: 2 },
);

provide("contentCardInGroup", true);
const appearance = useProseAppearance("cards", () => props.appearance);
// Children must render on the same surface as the tray they sit in.
provide("contentCardsAppearance", appearance);
const columns = computed(() => Math.min(3, Math.max(1, Number(props.cols) || 2)));
</script>

<template>
  <div
    :class="cn('content-cards not-prose', props.class)"
    :data-appearance="appearance"
    :data-columns="columns"
  >
    <slot />
  </div>
</template>
