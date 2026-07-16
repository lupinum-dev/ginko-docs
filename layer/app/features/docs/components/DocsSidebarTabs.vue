<script setup lang="ts">
import type { DocsNavigationSection } from "#ginko-docs/features/docs/docs-navigation";

defineProps<{
  sections: Array<DocsNavigationSection & { title: string }>;
  activeId: string;
}>();

const emit = defineEmits<{
  "update:activeId": [id: string];
}>();
</script>

<template>
  <div
    class="inline-flex h-9 w-full items-center justify-center overflow-hidden rounded-lg bg-muted p-[3px] text-muted-foreground"
    role="tablist"
    aria-orientation="horizontal"
    data-slot="docs-sidebar-tabs"
  >
    <button
      v-for="section in sections"
      :key="section.id"
      type="button"
      role="tab"
      :title="section.title"
      :aria-selected="activeId === section.id"
      :data-state="activeId === section.id ? 'active' : 'inactive'"
      class="inline-flex h-[calc(100%-1px)] min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground"
      @click="emit('update:activeId', section.id)"
    >
      {{ section.title }}
    </button>
  </div>
</template>
