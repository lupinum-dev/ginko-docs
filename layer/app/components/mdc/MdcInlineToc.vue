<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, inject } from "vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#ginko-docs/components/ui/collapsible";
import DocsToc from "#ginko-docs/features/docs/components/DocsToc.vue";
import { docsTocKey } from "#ginko-docs/features/docs/toc-context";
import { filterTocByDepth } from "#ginko-docs/utils/content";
import { useI18n } from "#imports";
import { cn } from "../../utils";

const props = defineProps<{
  title?: string;
  /** Restrict to headings up to this depth (within the page TOC depth). */
  depth?: number;
  open?: boolean | string;
  class?: HTMLAttributes["class"];
}>();

const { t } = useI18n();
const pageToc = inject(docsTocKey, undefined);

const items = computed(() => {
  const all = pageToc?.value ?? [];
  return props.depth ? filterTocByDepth(all, props.depth) : all;
});

const defaultOpen = computed(() => props.open === true || props.open === "true");
</script>

<template>
  <Collapsible
    v-if="items.length"
    :default-open="defaultOpen"
    :class="
      cn(
        'content-inline-toc not-prose my-4 rounded-xl border bg-card text-card-foreground shadow-xs',
        props.class,
      )
    "
  >
    <CollapsibleTrigger
      class="group flex w-full items-center gap-2 rounded-[inherit] px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Icon name="lucide:list" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span class="min-w-0 truncate">{{ title ?? t("docs.toc") }}</span>
      <Icon
        name="lucide:chevron-down"
        class="ms-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
    <CollapsibleContent class="px-4 pb-4">
      <DocsToc :items="items" :show-title="false" />
    </CollapsibleContent>
  </Collapsible>
</template>
