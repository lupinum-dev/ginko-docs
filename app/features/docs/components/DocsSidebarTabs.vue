<script setup lang="ts">
import type { DocsNavigationSection } from "@/features/docs/docs-navigation";

defineProps<{
  sections: DocsNavigationSection[];
  activeId: string;
}>();

const emit = defineEmits<{
  "update:activeId": [id: string];
}>();

function selectById(id: string) {
  emit("update:activeId", id);
}
</script>

<template>
  <div
    v-if="sections.length > 0"
    class="flex w-full flex-col gap-2 overflow-hidden"
    data-slot="docs-sidebar-tabs"
  >
    <div
      class="inline-flex h-9 w-full items-center justify-center overflow-hidden rounded-lg bg-muted p-[3px] text-muted-foreground"
      role="tablist"
      aria-orientation="horizontal"
    >
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        :title="section.title"
        class="inline-flex h-[calc(100%-1px)] min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground"
        role="tab"
        :aria-selected="activeId === section.id"
        :data-state="activeId === section.id ? 'active' : 'inactive'"
        @click="selectById(section.id)"
      >
        {{ section.title }}
      </button>
    </div>
  </div>
</template>
