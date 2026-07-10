<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { DocsNavigationItem } from "@/features/docs/docs-navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

defineOptions({
  name: "DocsSidebarItem",
});

const props = defineProps<{
  item: DocsNavigationItem;
  depth: number;
}>();

const route = useRoute();

function itemIsExactActive(path: string, item: DocsNavigationItem): boolean {
  return Boolean(item.path && path === item.path);
}

function itemHasActiveDescendant(path: string, item: DocsNavigationItem): boolean {
  return item.children.some(
    (child) => itemIsExactActive(path, child) || itemHasActiveDescendant(path, child),
  );
}

function folderShouldBeOpen(path: string, item: DocsNavigationItem): boolean {
  return (
    item.children.length > 0 &&
    (itemIsExactActive(path, item) || itemHasActiveDescendant(path, item))
  );
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
    "data-[active=true]:bg-primary/5 data-[active=true]:text-primary data-[active=true]:hover:transition-colors",
    props.depth > 0
      ? "data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5 data-[active=true]:before:w-px data-[active=true]:before:bg-primary data-[active=true]:before:content-['']"
      : undefined,
    paddingClass.value,
  ),
);

const splitFolderRowClass = computed(() =>
  cn(
    "group relative flex w-full flex-row items-center rounded-lg text-start [overflow-wrap:anywhere] text-muted-foreground transition-colors outline-none",
    "hover:bg-accent/50 hover:text-accent-foreground/80 hover:transition-none",
    "data-[active=true]:bg-primary/5 data-[active=true]:text-primary data-[active=true]:hover:transition-colors",
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
  <div v-if="item.children.length > 0" :data-state="folderOpen ? 'open' : 'closed'">
    <div
      v-if="item.path"
      :class="splitFolderRowClass"
      :data-active="isExactActive ? 'true' : 'false'"
    >
      <NuxtLink
        :to="item.path"
        class="flex min-w-0 flex-1 items-center gap-2 rounded-s-lg py-2 pe-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-slot="docs-sidebar-folder-link"
      >
        <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" aria-hidden="true" />
        <span class="min-w-0 truncate">{{ item.title }}</span>
        <Badge
          v-if="item.badge"
          variant="secondary"
          class="ms-auto h-4 shrink-0 rounded-sm px-1.5 py-0 text-[10px]"
        >
          {{ item.badge }}
        </Badge>
      </NuxtLink>
      <button
        class="group flex size-9 shrink-0 items-center justify-center rounded-e-lg transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        data-slot="docs-sidebar-folder-toggle"
        type="button"
        :aria-expanded="folderOpen"
        :data-state="folderOpen ? 'open' : 'closed'"
        @click="folderOpen = !folderOpen"
      >
        <Icon
          name="lucide:chevron-down"
          class="size-4 shrink-0 -rotate-90 transition-transform duration-200 group-data-[state=open]:rotate-0 rtl:rotate-90"
          aria-hidden="true"
        />
        <span class="sr-only">{{ item.title }}</span>
      </button>
    </div>
    <button
      v-else
      :class="linkRowClass"
      :data-active="isExactActive ? 'true' : 'false'"
      :data-state="folderOpen ? 'open' : 'closed'"
      :aria-expanded="folderOpen"
      type="button"
      @click="folderOpen = !folderOpen"
    >
      <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" aria-hidden="true" />
      <span class="min-w-0 truncate">{{ item.title }}</span>
      <Badge
        v-if="item.badge"
        variant="secondary"
        class="ms-auto h-4 shrink-0 rounded-sm px-1.5 py-0 text-[10px]"
      >
        {{ item.badge }}
      </Badge>
      <Icon
        name="lucide:chevron-down"
        class="ms-auto size-4 shrink-0 -rotate-90 transition-transform duration-200 group-data-[state=open]:rotate-0 rtl:rotate-90"
        aria-hidden="true"
      />
    </button>
    <div v-show="folderOpen" :class="contentRailClass">
      <DocsSidebarItem
        v-for="child in item.children"
        :key="child.path ?? child.title"
        :item="child"
        :depth="depth + 1"
      />
    </div>
  </div>
  <NuxtLink
    v-else-if="item.path"
    :to="item.path"
    :class="linkRowClass"
    :data-active="isExactActive ? 'true' : 'false'"
  >
    <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" aria-hidden="true" />
    <span class="min-w-0 truncate">{{ item.title }}</span>
    <Badge
      v-if="item.badge"
      variant="secondary"
      class="ms-auto h-4 shrink-0 rounded-sm px-1.5 py-0 text-[10px]"
    >
      {{ item.badge }}
    </Badge>
  </NuxtLink>
</template>
