<script setup lang="ts">
import type { DocsNavigationSection } from "@/features/docs/docs-navigation";

const defaultNavIcon = "lucide:building-2";

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
  <ul v-if="sections.length > 0" data-slot="list" class="flex flex-col gap-0.5">
    <li v-for="section in sections" :key="section.id" data-slot="item" class="relative">
      <button
        type="button"
        data-slot="link"
        class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          activeId === section.id
            ? 'bg-accent/50 font-medium text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        "
        @click="selectById(section.id)"
      >
        <Icon :name="section.icon ?? defaultNavIcon" class="size-4 shrink-0" aria-hidden="true" />
        <span data-slot="linkLabel" class="truncate">{{ section.title }}</span>
      </button>
    </li>
  </ul>
</template>
