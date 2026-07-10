<script setup lang="ts">
import type { ComputedRef, HTMLAttributes } from "vue";
import { computed, inject } from "vue";
import { cn } from "../../utils";

type StepsVariant = "icons" | "numbered";

const props = defineProps<{
  title?: string;
  icon?: string;
  class?: HTMLAttributes["class"];
}>();

const stepsVariant = inject<ComputedRef<StepsVariant>>(
  "mdcStepsVariant",
  computed(() => "icons"),
);

const isNumbered = computed(() => stepsVariant.value === "numbered");

const iconName = computed(() => {
  const icon = props.icon?.trim();
  if (!icon) return "lucide:circle";
  return icon.includes(":") ? icon : `lucide:${icon}`;
});
</script>

<template>
  <div :class="cn('content-step', props.class)">
    <div class="content-step-marker" aria-hidden="true">
      <Icon v-if="!isNumbered" :name="iconName" class="size-3.5" />
    </div>

    <div class="content-step-body content-prose content-prose-trim">
      <p v-if="title" class="content-step-title">
        {{ title }}
      </p>
      <slot />
    </div>
  </div>
</template>
