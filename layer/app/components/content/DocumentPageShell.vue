<script setup lang="ts">
import type { FlatTocItem } from "#ginko-docs/utils/content";
import { useI18n } from "#imports";

const props = withDefaults(
  defineProps<{
    /** Server-provided table of contents from content metadata. */
    tocItems?: FlatTocItem[];
    tocTitle?: string;
    /** Inner wrapper (e.g. imprint: `max-w-2xl mx-auto w-full`). Default: full width of column. */
    contentClass?: string;
    /** Horizontal page gutter; set false when the parent layout already pads (e.g. blog). */
    padded?: boolean;
  }>(),
  {
    tocItems: () => [],
    contentClass: "w-full",
    padded: true,
  },
);

const { t } = useI18n();
</script>

<template>
  <div class="mx-auto w-full max-w-3xl" :class="padded ? 'px-4 md:px-6' : undefined">
    <div class="pt-8 pb-12 md:pt-10 md:pb-16 lg:pb-20">
      <div :class="contentClass">
        <nav
          v-if="tocItems.length > 0"
          :aria-label="tocTitle ?? t('docs.toc')"
          class="not-prose mb-8 border-b border-border pb-8"
        >
          <p class="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {{ tocTitle ?? t("docs.toc") }}
          </p>
          <ul class="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2" role="list">
            <li v-for="item in tocItems" :key="item.id">
              <a
                :href="`#${item.id}`"
                class="text-sm leading-snug text-foreground/80 transition-colors hover:text-foreground"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </nav>

        <article class="[&_h2[id]]:scroll-mt-[var(--content-scroll-margin)]">
          <slot />
        </article>
      </div>
    </div>
  </div>
</template>
