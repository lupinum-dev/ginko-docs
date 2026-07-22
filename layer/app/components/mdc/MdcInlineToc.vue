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

const defaultOpen = computed(
  () => props.open !== undefined && props.open !== false && props.open !== "false",
);
</script>

<template>
  <Collapsible
    v-if="items.length"
    :default-open="defaultOpen"
    :class="cn('content-inline-toc not-prose', props.class)"
  >
    <CollapsibleTrigger class="content-inline-toc-trigger">
      <Icon name="lucide:list" class="content-inline-toc-icon" aria-hidden="true" />
      <span class="content-inline-toc-title">{{ title ?? t("docs.toc") }}</span>
      <Icon name="lucide:chevron-down" class="content-inline-toc-chevron" aria-hidden="true" />
    </CollapsibleTrigger>
    <CollapsibleContent class="content-inline-toc-content">
      <DocsToc :items="items" :show-title="false" />
    </CollapsibleContent>
  </Collapsible>
</template>
