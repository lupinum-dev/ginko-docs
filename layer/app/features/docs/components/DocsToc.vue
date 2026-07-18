<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
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

const activeIndex = computed(() =>
  props.activeId ? props.items.findIndex((item) => item.id === props.activeId) : -1,
);

const indicatorStyle = computed(() => {
  if (activeIndex.value === -1) {
    return {
      opacity: "0",
      height: "1.75rem",
      top: "0",
    };
  }

  return {
    "--indicator-position": `${activeIndex.value * 1.75}rem`,
    opacity: "1",
    height: "1.75rem",
    top: "var(--indicator-position, 0rem)",
  };
});
</script>

<template>
  <nav v-if="items.length" :class="cn('w-full', props.class)" :aria-label="t('docs.toc')">
    <h3
      v-if="showTitle"
      class="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
    >
      <Icon name="lucide:list" class="size-3.5 shrink-0" aria-hidden="true" />
      {{ t("docs.toc") }}
    </h3>

    <div class="relative border-l border-border pl-3">
      <div
        class="pointer-events-none absolute -left-px w-0.5 rounded-full bg-primary transition-all duration-200"
        :style="indicatorStyle"
      />

      <ul class="space-y-1">
        <li v-for="item in items" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="block truncate py-0.5 text-[13px] leading-5 transition-colors"
            :class="
              cn(
                item.depth === 3 ? 'pl-3' : (item.depth ?? 2) >= 4 ? 'pl-6' : '',
                activeId === item.id
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )
            "
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>
