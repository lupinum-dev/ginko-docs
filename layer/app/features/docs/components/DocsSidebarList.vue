<script setup lang="ts">
import type { DocsNavigationSection } from "#ginko-docs/features/docs/docs-navigation";

const defaultIcon = "lucide:book-open";

defineProps<{
  sections: Array<DocsNavigationSection & { title: string }>;
  activeId: string;
}>();

const emit = defineEmits<{
  "update:activeId": [id: string];
}>();
</script>

<template>
  <ul class="flex flex-col gap-0.5" data-slot="docs-sidebar-list">
    <li v-for="section in sections" :key="section.id">
      <button
        type="button"
        class="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-start text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          activeId === section.id
            ? 'bg-muted font-medium text-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        "
        :aria-pressed="activeId === section.id"
        @click="emit('update:activeId', section.id)"
      >
        <Icon :name="section.icon ?? defaultIcon" class="size-4 shrink-0" aria-hidden="true" />
        <span class="truncate">{{ section.title }}</span>
      </button>
    </li>
  </ul>
</template>
