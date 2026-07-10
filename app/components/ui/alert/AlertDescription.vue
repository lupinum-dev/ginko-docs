<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="alert-description"
    :class="
      cn(
        'col-start-2 text-sm text-balance text-muted-foreground group-has-[>[data-slot=alert-icon]]/alert:col-start-2 md:text-pretty',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
