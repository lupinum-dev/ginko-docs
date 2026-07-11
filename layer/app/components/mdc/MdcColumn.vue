<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref, type HTMLAttributes } from "vue";
import { cn } from "../../utils";

type ValueProp<T extends string> = T | { value?: T | string };
type ColumnSize = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    size?: ValueProp<ColumnSize>;
    class?: HTMLAttributes["class"];
  }>(),
  {
    size: "md",
  },
);

const parentLayoutType = inject(
  "mdc-layout-type",
  computed(() => "default"),
);

const sizeValue = computed<ColumnSize>(() => {
  if (typeof props.size === "string") return props.size;
  return (props.size?.value as ColumnSize | undefined) ?? "md";
});

const columnSizeClass = {
  sm: "content-layout-column-sm",
  md: "content-layout-column-md",
  lg: "content-layout-column-lg",
} as const;

const isLastColumn = ref(false);
const columnRef = ref<HTMLElement | null>(null);

onMounted(() => {
  nextTick(() => {
    if (columnRef.value?.parentElement) {
      const siblings = Array.from(columnRef.value.parentElement.children);
      isLastColumn.value = siblings.indexOf(columnRef.value) === siblings.length - 1;
    }
  });
});

const showDivider = computed(
  () => !isLastColumn.value && ["border", "border-dashed"].includes(parentLayoutType.value),
);
</script>

<template>
  <div
    ref="columnRef"
    :class="
      cn(
        'content-layout-column',
        columnSizeClass[sizeValue],
        showDivider && 'content-layout-column-divider',
        showDivider &&
          parentLayoutType === 'border-dashed' &&
          'content-layout-column-divider-dashed',
        props.class,
      )
    "
  >
    <div class="content-layout-column-inner">
      <slot />
    </div>
  </div>
</template>
