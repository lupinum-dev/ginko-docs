<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  docsNavigationItemContainsPath,
  normalizeDocsNavigationPath,
  type DocsNavigationItem,
} from "#ginko-docs/features/docs/docs-navigation";
import { Button } from "#ginko-docs/components/ui/button";
import DocsSidebarRow from "./DocsSidebarRow.vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#ginko-docs/components/ui/collapsible";
import { cn } from "#ginko-docs/lib/utils";

defineOptions({
  name: "DocsSidebarItem",
});

const props = defineProps<{
  item: DocsNavigationItem;
  depth: number;
}>();

const route = useRoute();

function itemIsExactActive(path: string, item: DocsNavigationItem): boolean {
  return Boolean(
    item.path && normalizeDocsNavigationPath(path) === normalizeDocsNavigationPath(item.path),
  );
}

function folderShouldBeOpen(path: string, item: DocsNavigationItem): boolean {
  return item.children.length > 0 && docsNavigationItemContainsPath(item, path);
}

const isExactActive = computed(() => itemIsExactActive(route.path, props.item));

const paddingClass = computed(() => {
  const steps = ["ps-2", "ps-5", "ps-8", "ps-11"] as const;
  return steps[Math.min(props.depth, steps.length - 1)]!;
});

const linkRowClass = computed(() =>
  cn(
    "group relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start [overflow-wrap:anywhere] text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    "hover:bg-accent/50 hover:text-accent-foreground/80 hover:transition-none",
    "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:hover:transition-colors",
    props.depth > 0
      ? "data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5 data-[active=true]:before:w-px data-[active=true]:before:bg-primary data-[active=true]:before:content-['']"
      : undefined,
    paddingClass.value,
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

const contentRailClass =
  "relative flex flex-col gap-0.5 *:first:mt-0.5 before:absolute before:start-2.5 before:inset-y-1 before:w-px before:bg-border before:content-['']";
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
