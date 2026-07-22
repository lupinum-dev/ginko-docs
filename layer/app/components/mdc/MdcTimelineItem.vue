<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  date?: string;
  label?: string;
  title?: string;
  active?: boolean;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="cn('content-timeline-item', props.class)" :data-active="active || undefined">
    <span class="content-timeline-dot" aria-hidden="true" />
    <div class="content-timeline-meta">
      <span v-if="date" class="content-timeline-date">
        {{ date }}
      </span>
      <span v-if="label" class="content-timeline-label">
        {{ label }}
      </span>
    </div>
    <p v-if="title" class="content-timeline-title">
      {{ title }}
    </p>
    <div class="content-timeline-body content-prose content-prose-trim">
      <slot />
    </div>
  </div>
</template>
