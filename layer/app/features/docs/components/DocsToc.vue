<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { cn } from "#ginko-docs/lib/utils";
import type { FlatTocItem } from "#ginko-docs/utils/content";
import { useI18n } from "#imports";

const props = withDefaults(
  defineProps<{
    items: FlatTocItem[];
    activeIds?: string[];
    showTitle?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  {
    showTitle: true,
    activeIds: () => [],
  },
);
const { t } = useI18n();

// Indicator geometry assumes every row is exactly 1.75rem tall:
// py-0.5 (0.25rem) + leading-5 (1.25rem) + space-y-1 gap (0.25rem),
// single line enforced by `truncate`.
const ROW_HEIGHT_REM = 1.75;

const activeRange = computed(() => {
  let first = -1;
  let last = -1;
  props.items.forEach((item, index) => {
    if (!props.activeIds.includes(item.id)) return;
    if (first === -1) first = index;
    last = index;
  });
  return first === -1 ? null : { first, last };
});

const indicatorStyle = computed(() => {
  if (!activeRange.value) {
    return { opacity: "0", height: `${ROW_HEIGHT_REM}rem`, top: "0" };
  }

  const { first, last } = activeRange.value;
  return {
    opacity: "1",
    top: `${first * ROW_HEIGHT_REM}rem`,
    height: `${(last - first + 1) * ROW_HEIGHT_REM}rem`,
  };
});

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  // scrollIntoView ignores the global reduced-motion CSS override, so check
  // explicitly. `scroll-margin-top` on headings handles the sticky offset.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  // Sync the hash without router involvement — router-driven hash navigation
  // would scroll-restore and fight the smooth scroll above.
  history.replaceState(history.state, "", `#${encodeURIComponent(id)}`);
}
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
        class="pointer-events-none absolute -left-px w-0.5 rounded-full bg-primary transition-all duration-200 ease-out"
        :style="indicatorStyle"
      />

      <ul class="space-y-1">
        <li v-for="item in items" :key="item.id">
          <a
            :href="`#${item.id}`"
            :title="item.label"
            :data-toc-active="activeIds.includes(item.id) ? 'true' : undefined"
            class="block truncate rounded-sm py-0.5 text-[13px] leading-5 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            :class="
              cn(
                item.depth === 3 ? 'pl-3' : (item.depth ?? 2) >= 4 ? 'pl-6' : '',
                activeIds.includes(item.id)
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )
            "
            @click.prevent="scrollToHeading(item.id)"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>
