<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "#ginko-docs/lib/utils";
import { useI18n } from "#imports";

export interface TocItem {
  id: string;
  label: string;
  depth?: number; // 2 = h2, 3 = h3
}

const props = withDefaults(
  defineProps<{
    items: TocItem[];
    activeId?: string;
    showTitle?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  {
    showTitle: true,
  },
);
const { t } = useI18n();
</script>

<template>
  <div v-if="items.length" :class="cn('w-full', props.class)">
    <h3 v-if="showTitle" class="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon name="lucide:list" class="size-3.5 shrink-0" aria-hidden="true" />
      {{ t("docs.toc") }}
    </h3>

    <div class="relative space-y-1 border-l border-border pl-3 text-[13px]">
      <!-- Animated active indicator -->
      <div
        class="absolute -left-px w-0.5 rounded-full bg-primary transition-all duration-200"
        :style="
          activeId && items.findIndex((i) => i.id === activeId) !== -1
            ? `top: ${items.findIndex((i) => i.id === activeId) * 26 + 2}px; height: 20px; opacity: 1;`
            : 'top: 2px; height: 20px; opacity: 0;'
        "
      />

      <a
        v-for="item in items"
        :key="item.id"
        :href="`#${item.id}`"
        class="block truncate py-0.5 leading-5 transition-colors"
        :class="[
          item.depth === 3 ? 'pl-3' : '',
          activeId === item.id
            ? 'font-medium text-primary'
            : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        {{ item.label }}
      </a>
    </div>
  </div>
</template>
