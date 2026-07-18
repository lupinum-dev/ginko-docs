<script setup lang="ts">
import { computed } from "vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#ginko-docs/components/ui/collapsible";
import { resolveIconifyIcon } from "./icons";

const props = withDefaults(
  defineProps<{
    name: string;
    open?: boolean;
    icon?: string;
  }>(),
  {
    open: true,
  },
);

const iconName = computed(() =>
  props.icon ? (resolveIconifyIcon(props.icon) ?? props.icon) : null,
);
</script>

<template>
  <Collapsible :default-open="open">
    <CollapsibleTrigger
      class="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start [overflow-wrap:anywhere] transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Icon
        name="lucide:chevron-right"
        class="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-90 rtl:rotate-180"
        aria-hidden="true"
      />
      <template v-if="iconName">
        <Icon :name="iconName" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </template>
      <template v-else>
        <Icon
          name="lucide:folder"
          class="size-4 shrink-0 text-muted-foreground group-data-[state=open]:hidden"
          aria-hidden="true"
        />
        <Icon
          name="lucide:folder-open"
          class="hidden size-4 shrink-0 text-muted-foreground group-data-[state=open]:block"
          aria-hidden="true"
        />
      </template>
      <span class="min-w-0">{{ name }}</span>
    </CollapsibleTrigger>
    <CollapsibleContent
      class="relative ms-[1.0625rem] border-s border-border ps-2 *:first:mt-0.5"
    >
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>
