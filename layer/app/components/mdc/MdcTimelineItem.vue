<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { cn } from "../../utils";
import { resolveIconifyIcon } from "./icons";

const props = defineProps<{
  date?: string;
  label?: string;
  title?: string;
  icon?: string;
  active?: boolean;
  class?: HTMLAttributes["class"];
}>();

const iconName = computed(() => resolveIconifyIcon(props.icon));
</script>

<template>
  <div :class="cn('content-timeline-item', props.class)" :data-active="active || undefined">
    <span class="content-timeline-marker" aria-hidden="true">
      <Icon v-if="iconName" :name="iconName" class="content-timeline-marker-icon" />
      <span class="content-timeline-marker-dot" />
    </span>
    <div v-if="title || date || label" class="content-timeline-head">
      <p v-if="title" class="content-timeline-title">
        {{ title }}
      </p>
      <span v-if="date" class="content-timeline-date">
        {{ date }}
      </span>
      <span v-if="label" class="content-timeline-label">
        {{ label }}
      </span>
    </div>
    <div class="content-timeline-body content-prose content-prose-trim">
      <slot />
    </div>
  </div>
</template>
