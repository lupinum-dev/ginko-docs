<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "../../utils";

type ValueProp<T extends string> = T | { value?: T | string };
type CenterSize = "sm" | "md" | "lg";
type CenterType = "default" | "card" | "border" | "border-dashed" | "outline" | "outline-dashed";

const props = withDefaults(
  defineProps<{
    size?: ValueProp<CenterSize>;
    max?: CenterSize;
    type?: ValueProp<CenterType>;
    class?: HTMLAttributes["class"];
  }>(),
  {
    size: "md",
    type: "default",
  },
);

const centerTypeValue = computed<CenterType>(() => {
  if (typeof props.type === "string") return props.type;
  return (props.type?.value as CenterType | undefined) ?? "default";
});

const sizeValue = computed<CenterSize>(() => {
  if (props.max) return props.max;
  if (typeof props.size === "string") return props.size;
  return (props.size?.value as CenterSize | undefined) ?? "md";
});

const centerSizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;
</script>

<template>
  <div :class="cn('mx-auto flex justify-center p-2', props.class)">
    <div
      v-if="centerTypeValue === 'card'"
      :class="
        cn(
          'mx-auto w-full rounded-lg border bg-card p-6 text-center shadow-xs',
          centerSizeClass[sizeValue],
        )
      "
    >
      <slot />
    </div>
    <div
      v-else
      :class="
        cn(
          'mx-auto w-full text-center',
          centerSizeClass[sizeValue],
          centerTypeValue !== 'default' && 'rounded-lg p-4',
          centerTypeValue === 'border' && 'border border-border',
          centerTypeValue === 'border-dashed' && 'border border-dashed border-border',
          centerTypeValue === 'outline' && 'outline outline-1 outline-offset-2 outline-border',
          centerTypeValue === 'outline-dashed' &&
            'outline-1 outline-offset-2 outline-border outline-dashed',
        )
      "
    >
      <slot />
    </div>
  </div>
</template>
