<script setup lang="ts">
import { computed, inject, provide, ref } from "vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#ginko-docs/components/ui/collapsible";
import { cn } from "../../utils";
import { filesHighlightKey, filesParentPathKey } from "./files-context";
import { resolveIconifyIcon } from "./icons";

const props = withDefaults(
  defineProps<{
    name: string;
    open?: boolean | string;
    icon?: string;
    active?: boolean | string;
  }>(),
  {
    // Vue casts an absent Boolean-typed prop to false; the explicit default
    // keeps folders open unless the author opts out.
    open: true,
  },
);

const parentPath = inject(filesParentPathKey, undefined);
const highlight = inject(filesHighlightKey, undefined);
const fullPath = computed(() =>
  parentPath?.value ? `${parentPath.value}/${props.name}` : props.name,
);
provide(filesParentPathKey, fullPath);

const isOpen = ref(props.open !== false && props.open !== "false");
const isActive = computed(
  () =>
    props.active === true ||
    props.active === "true" ||
    (highlight?.value !== undefined && highlight.value === fullPath.value),
);

const iconName = computed(() => {
  if (props.icon) return resolveIconifyIcon(props.icon) ?? props.icon;
  return isOpen.value ? "lucide:folder-open" : "lucide:folder";
});
</script>

<template>
  <Collapsible v-model:open="isOpen" :unmount-on-hide="false">
    <CollapsibleTrigger
      :data-active="isActive ? 'true' : undefined"
      :class="
        cn(
          'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start [overflow-wrap:anywhere] transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          isActive && 'bg-primary/10 text-primary hover:bg-primary/10',
        )
      "
    >
      <Icon
        name="lucide:chevron-right"
        class="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-90 rtl:rotate-180"
        aria-hidden="true"
      />
      <Icon
        :name="iconName"
        :class="cn('size-4 shrink-0', isActive ? 'text-primary/80' : 'text-muted-foreground')"
        aria-hidden="true"
      />
      <span class="min-w-0">{{ name }}</span>
    </CollapsibleTrigger>
    <CollapsibleContent class="relative ms-[1.0625rem] border-s border-border ps-2 *:first:mt-0.5">
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>
