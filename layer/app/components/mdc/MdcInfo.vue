<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import MdcCallout from "./MdcCallout.vue";

const props = defineProps<{
  title?: string;
  icon?: string;
  appearance?: "quiet" | "tint";
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <MdcCallout :title="title" :icon="icon" type="info" :appearance="appearance" :class="props.class">
    <slot />
  </MdcCallout>
</template>
