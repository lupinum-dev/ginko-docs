<script setup lang="ts">
import type { DocsNavigationItem } from "#ginko-docs/features/docs/docs-navigation";
import { Badge } from "#ginko-docs/components/ui/badge";

defineProps<{
  item: DocsNavigationItem;
  showChevron?: boolean;
}>();
</script>

<template>
  <Icon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" aria-hidden="true" />
  <span class="min-w-0 truncate">{{ item.title }}</span>
  <Badge
    v-if="item.badge"
    variant="secondary"
    class="ms-auto h-4 shrink-0 rounded-full px-1.5 py-0 text-[10px]"
  >
    {{ item.badge }}
  </Badge>
  <Icon
    v-if="showChevron"
    name="lucide:chevron-down"
    class="ms-auto size-3.5 shrink-0 -rotate-90 text-muted-foreground/70 transition-transform duration-200 ease-out group-hover:text-muted-foreground group-data-[state=open]:rotate-0 group-data-[active=true]:text-primary/70 rtl:rotate-90"
    aria-hidden="true"
  />
</template>
