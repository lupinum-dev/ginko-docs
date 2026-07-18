<script setup lang="ts">
import { computed, inject } from "vue";
import { cn } from "../../utils";
import { resolveFileIcon } from "../../utils/file-icons";
import { filesHighlightKey, filesParentPathKey } from "./files-context";
import { resolveIconifyIcon } from "./icons";

const props = defineProps<{
  name: string;
  icon?: string;
  annotation?: string;
  active?: boolean | string;
}>();

const parentPath = inject(filesParentPathKey, undefined);
const highlight = inject(filesHighlightKey, undefined);
const fullPath = computed(() =>
  parentPath?.value ? `${parentPath.value}/${props.name}` : props.name,
);

const isActive = computed(
  () =>
    props.active === true ||
    props.active === "true" ||
    (highlight?.value !== undefined && highlight.value === fullPath.value),
);

const iconName = computed(() =>
  props.icon ? (resolveIconifyIcon(props.icon) ?? props.icon) : resolveFileIcon(props.name),
);
</script>

<template>
  <div
    :data-active="isActive ? 'true' : undefined"
    :class="
      cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 [overflow-wrap:anywhere]',
        isActive && 'bg-primary/10 text-primary',
      )
    "
  >
    <Icon
      :name="iconName"
      :class="cn('size-4 shrink-0', isActive ? 'text-primary/80' : 'text-muted-foreground')"
      aria-hidden="true"
    />
    <span class="min-w-0">{{ name }}</span>
    <span v-if="annotation" class="ms-auto shrink-0 ps-3 text-xs text-muted-foreground">
      {{ annotation }}
    </span>
  </div>
</template>
