<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { cn } from "../../utils";
import { resolveIconifyIcon } from "./icons";

type CalloutType = "note" | "alert" | "info" | "warn" | "warning" | "error" | "success" | "idea";

const props = withDefaults(
  defineProps<{
    title?: string;
    type?: CalloutType;
    icon?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    type: "info",
  },
);

const normalizedType = computed(() => {
  if (props.type === "warn" || props.type === "alert") return "warning";

  return props.type;
});

const iconName = computed(() => {
  if (props.icon) return resolveIconifyIcon(props.icon) ?? props.icon;

  return (
    {
      note: "lucide:file-text",
      info: "lucide:info",
      warning: "lucide:triangle-alert",
      error: "lucide:circle-x",
      success: "lucide:circle-check",
      idea: "lucide:lightbulb",
    }[normalizedType.value] ?? "lucide:info"
  );
});
</script>

<template>
  <div
    data-slot="alert"
    role="alert"
    :class="cn('content-callout not-prose my-4', `content-callout-${normalizedType}`, props.class)"
  >
    <span class="content-callout-bar" aria-hidden="true" />
    <span data-slot="alert-icon" class="content-callout-icon" aria-hidden="true">
      <Icon :name="iconName" class="mt-1 size-5" />
    </span>
    <div class="content-callout-body">
      <div v-if="title" data-slot="alert-title" class="content-alert-title">
        {{ title }}
      </div>
      <div data-slot="alert-description" class="content-prose content-prose-trim">
        <slot unwrap="p" />
      </div>
    </div>
  </div>
</template>
