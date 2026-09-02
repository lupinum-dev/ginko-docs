<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  navigationItemContainsPath,
  normalizeNavigationPath,
} from "@lupinum/ginko-content/navigation";
import type { DocsNavigationItem } from "#ginko-docs/features/docs/docs-navigation";
import { Button } from "#ginko-docs/components/ui/button";
import DocsSidebarRow from "./DocsSidebarRow.vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#ginko-docs/components/ui/collapsible";
import { cn } from "#ginko-docs/utils";

defineOptions({
  name: "DocsSidebarItem",
});

const props = defineProps<{
  item: DocsNavigationItem;
  depth: number;
}>();

const route = useRoute();

function itemIsExactActive(path: string, item: DocsNavigationItem): boolean {
  return Boolean(item.path && normalizeNavigationPath(path) === normalizeNavigationPath(item.path));
}

function folderShouldBeOpen(path: string, item: DocsNavigationItem): boolean {
  return item.children.length > 0 && navigationItemContainsPath(item, path);
}

const isExactActive = computed(() => itemIsExactActive(route.path, props.item));

const paddingClass = computed(() => {
  const steps = ["ps-[13px]", "ps-[25px]", "ps-[37px]"] as const;
  return steps[Math.min(Math.max(props.depth - 1, 0), steps.length - 1)]!;
});

// Depth 0: compact pill rows. Depth > 0: each row carries the rail as its own
// start border so the active segment recolors it — aligned by construction.
const linkRowClass = computed(() =>
  cn(
    "group relative flex w-full flex-row items-center gap-2 text-start [overflow-wrap:anywhere] text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    "hover:bg-accent/50 hover:text-accent-foreground/80 hover:transition-none",
    "data-[active=true]:bg-muted data-[active=true]:text-foreground data-[active=true]:font-medium data-[active=true]:hover:bg-muted data-[active=true]:hover:transition-colors",
    props.depth === 0
      ? "rounded-[7px] px-2 py-[5.5px] text-[13px]"
      : cn(
          "rounded-e-[7px] border-s border-border py-[5px] pe-2 text-[12.5px]",
          "hover:border-s-muted-foreground/40",
          "data-[active=true]:border-s-brand",
          paddingClass.value,
        ),
  ),
);

const folderOpen = ref(folderShouldBeOpen(route.path, props.item));

watch(
  () => route.path,
  () => {
    if (folderShouldBeOpen(route.path, props.item)) {
      folderOpen.value = true;
    }
  },
);

// No gap between child rows: their start borders stack into one continuous
// rail. Deeper levels indent via padding only, sharing the same rail.
const contentRailClass = computed(() =>
  props.depth === 0 ? "ms-[15.5px] mt-0.5 mb-1 flex flex-col" : "flex flex-col",
);
</script>

<template>
  <Collapsible v-if="item.children.length > 0" v-model:open="folderOpen" :unmount-on-hide="false">
    <CollapsibleTrigger v-if="item.path" as-child>
      <NuxtLink
        :to="item.path"
        :class="linkRowClass"
        :aria-current="isExactActive ? 'page' : undefined"
        :data-active="isExactActive ? 'true' : 'false'"
      >
        <DocsSidebarRow :item="item" show-chevron />
      </NuxtLink>
    </CollapsibleTrigger>
    <CollapsibleTrigger v-else as-child>
      <Button
        variant="ghost"
        :class="linkRowClass"
        class="h-auto justify-start"
        :data-active="isExactActive ? 'true' : 'false'"
      >
        <DocsSidebarRow :item="item" show-chevron />
      </Button>
    </CollapsibleTrigger>

    <CollapsibleContent :class="contentRailClass">
      <DocsSidebarItem
        v-for="child in item.children"
        :key="child.path ?? child.title"
        :item="child"
        :depth="depth + 1"
      />
    </CollapsibleContent>
  </Collapsible>
  <NuxtLink
    v-else-if="item.path"
    :to="item.path"
    :aria-current="isExactActive ? 'page' : undefined"
    :class="linkRowClass"
    :data-active="isExactActive ? 'true' : 'false'"
  >
    <DocsSidebarRow :item="item" />
  </NuxtLink>
</template>
