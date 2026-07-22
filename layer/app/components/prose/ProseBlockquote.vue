<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, useAttrs } from "vue";
import { cn } from "../../utils";
import MdcCallout from "../mdc/MdcCallout.vue";

const props = defineProps<{
  dataAlert?: "note" | "tip" | "important" | "warning" | "caution";
  class?: HTMLAttributes["class"];
}>();

const attrs = useAttrs();
const alert = computed(() => props.dataAlert ?? attrs["data-alert"]);
const callout = computed(() => {
  if (alert.value === "tip") return { type: "success" as const, title: "Tip" };
  if (alert.value === "important") return { type: "info" as const, title: "Important" };
  if (alert.value === "warning") return { type: "warning" as const, title: "Warning" };
  if (alert.value === "caution") return { type: "error" as const, title: "Caution" };
  return { type: "note" as const, title: "Note" };
});
</script>

<template>
  <MdcCallout v-if="alert" :type="callout.type" :title="callout.title" :class="props.class">
    <slot />
  </MdcCallout>
  <blockquote v-else :class="cn(props.class)">
    <slot />
  </blockquote>
</template>
