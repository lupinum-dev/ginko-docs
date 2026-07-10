<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="alert-title"
    :class="
      cn(
        'col-start-2 font-medium group-has-[>[data-slot=alert-icon]]/alert:col-start-2',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
