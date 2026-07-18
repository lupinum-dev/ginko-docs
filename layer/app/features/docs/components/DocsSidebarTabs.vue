<script setup lang="ts">
import { computed } from "vue";
import {
  resolveDocsSectionTargetPath,
  type DocsNavigationSection,
} from "#ginko-docs/features/docs/docs-navigation";
import { Tabs, TabsList, TabsTrigger } from "#ginko-docs/components/ui/tabs";

const props = defineProps<{
  sections: Array<DocsNavigationSection & { title: string }>;
  activeId: string;
}>();

const emit = defineEmits<{
  "update:activeId": [id: string];
}>();

const tabs = computed(() =>
  props.sections.map((section) => ({
    id: section.id,
    title: section.title,
    target: resolveDocsSectionTargetPath(section),
  })),
);

function onTabClick(id: string, event: MouseEvent) {
  // Re-clicking the active section would otherwise navigate away from the
  // current page to the section's first page.
  if (id === props.activeId) event.preventDefault();
}
</script>

<template>
  <Tabs :model-value="activeId" activation-mode="manual" data-slot="docs-sidebar-tabs">
    <TabsList class="w-full">
      <template v-for="tab in tabs" :key="tab.id">
        <TabsTrigger v-if="tab.target" :value="tab.id" as-child>
          <NuxtLink
            :to="tab.target"
            :title="tab.title"
            class="min-w-0 flex-1 basis-0"
            @click="onTabClick(tab.id, $event)"
          >
            <span class="truncate">{{ tab.title }}</span>
          </NuxtLink>
        </TabsTrigger>
        <TabsTrigger
          v-else
          :value="tab.id"
          :title="tab.title"
          class="min-w-0 flex-1 basis-0"
          @click="emit('update:activeId', tab.id)"
        >
          <span class="truncate">{{ tab.title }}</span>
        </TabsTrigger>
      </template>
    </TabsList>
  </Tabs>
</template>
