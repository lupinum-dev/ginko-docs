<script setup lang="ts">
import { computed, provide, type HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | "1" | "2" | "3" | "4" | "5" | "6";
    class?: HTMLAttributes["class"];
  }>(),
  {
    cols: 2,
  },
);

provide("contentCardInGroup", true);

const colsClass = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
} as const;

const normalizedCols = computed<keyof typeof colsClass>(() => {
  const cols = Number(props.cols);

  return cols === 1 || cols === 2 || cols === 3 || cols === 4 || cols === 5 || cols === 6
    ? cols
    : 2;
});
</script>

<template>
  <div
    :class="
      cn(
        'content-card-group not-prose my-4 grid grid-cols-1 items-start gap-2',
        colsClass[normalizedCols],
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
