<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { AlertVariants } from ".";
import { cn } from "#ginko-docs/lib/utils";
import { alertVariants } from ".";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  variant?: AlertVariants["variant"];
}>();
</script>

<template>
  <div
    data-slot="alert"
    :class="cn(alertVariants({ variant: props.variant }), props.class)"
    role="alert"
  >
    <slot />
  </div>
</template>
