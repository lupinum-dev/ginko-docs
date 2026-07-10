<script setup lang="ts">
import { computed, provide, type HTMLAttributes } from "vue";
import { cn } from "../../utils";

type ValueProp<T extends string> = T | { value?: T | string };
type LayoutType = "default" | "card" | "border" | "border-dashed" | "outline" | "outline-dashed";

const props = withDefaults(
  defineProps<{
    type?: ValueProp<LayoutType>;
    class?: HTMLAttributes["class"];
  }>(),
  {
    type: "default",
  },
);

const layoutTypeValue = computed<LayoutType>(() => {
  if (typeof props.type === "string") return props.type;
  return (props.type?.value as LayoutType | undefined) ?? "default";
});

const layoutRowClass = "content-layout-row";

provide(
  "mdc-layout-type",
  computed(() => layoutTypeValue.value),
);
provide("mdc-inside-layout", true);
</script>

<template>
  <div :class="cn('content-layout h-full', props.class)">
    <div v-if="layoutTypeValue === 'card'" class="w-full">
      <div class="h-full">
        <div :class="layoutRowClass">
          <slot />
        </div>
      </div>
    </div>
    <div
      v-else
      :class="
        cn(
          layoutRowClass,
          'h-full',
          layoutTypeValue === 'border' && 'content-layout-row-border',
          layoutTypeValue === 'border-dashed' && 'content-layout-row-border-dashed',
          layoutTypeValue === 'outline' && 'content-layout-row-outline',
          layoutTypeValue === 'outline-dashed' && 'content-layout-row-outline-dashed',
        )
      "
    >
      <slot />
    </div>
  </div>
</template>
