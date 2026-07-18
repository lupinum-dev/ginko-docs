<script setup lang="ts">
import { computed } from "vue";
import { resolveFileIcon } from "../../utils/file-icons";
import { resolveIconifyIcon } from "./icons";

const props = defineProps<{
  name: string;
  icon?: string;
  annotation?: string;
}>();

const iconName = computed(() =>
  props.icon ? (resolveIconifyIcon(props.icon) ?? props.icon) : resolveFileIcon(props.name),
);
</script>

<template>
  <div class="flex items-center gap-2 rounded-md px-2 py-1.5 [overflow-wrap:anywhere]">
    <Icon :name="iconName" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    <span class="min-w-0">{{ name }}</span>
    <span v-if="annotation" class="ms-auto shrink-0 ps-3 text-xs text-muted-foreground">
      {{ annotation }}
    </span>
  </div>
</template>
