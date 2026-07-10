<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import MdcCallout from "./MdcCallout.vue";

type AlertType = "default" | "info" | "warning" | "success" | "danger" | "secondary";
type CalloutType = "info" | "warning" | "error" | "success" | "idea";

const props = withDefaults(
  defineProps<{
    title?: string;
    icon?: string;
    type?: AlertType;
    class?: HTMLAttributes["class"];
  }>(),
  {
    type: "warning",
  },
);

const calloutType = computed<CalloutType>(() => {
  if (props.type === "danger") return "error";
  if (props.type === "success") return "success";
  if (props.type === "info" || props.type === "secondary") return "info";

  return "warning";
});
</script>

<template>
  <MdcCallout :title="title" :icon="icon" :type="calloutType" :class="props.class">
    <slot />
  </MdcCallout>
</template>
