<script setup lang="ts">
import { computed } from "vue";
import type { DocsNavigationSection } from "#ginko-docs/features/docs/docs-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#ginko-docs/components/ui/dropdown-menu";

const defaultIcon = "lucide:book-open";

const props = defineProps<{
  sections: Array<DocsNavigationSection & { title: string }>;
  activeId: string;
}>();

const emit = defineEmits<{
  "update:activeId": [id: string];
}>();

const activeSection = computed(
  () => props.sections.find((section) => section.id === props.activeId) ?? props.sections[0],
);

function selectSection(value: unknown) {
  if (typeof value === "string") emit("update:activeId", value);
}
</script>

<template>
  <DropdownMenu v-if="activeSection">
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-start text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        data-slot="docs-sidebar-dropdown"
      >
        <Icon
          :name="activeSection.icon ?? defaultIcon"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ activeSection.title }}</span>
        <Icon
          name="lucide:chevrons-up-down"
          class="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-(--reka-dropdown-menu-trigger-width)">
      <DropdownMenuRadioGroup :model-value="activeId" @update:model-value="selectSection">
        <DropdownMenuRadioItem
          v-for="section in sections"
          :key="section.id"
          :value="section.id"
          class="gap-2"
        >
          <template #indicator-icon>
            <Icon name="lucide:check" class="size-4" aria-hidden="true" />
          </template>
          <Icon :name="section.icon ?? defaultIcon" class="size-4 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ section.title }}</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
