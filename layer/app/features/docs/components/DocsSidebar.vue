<script setup lang="ts">
import { cn } from "#ginko-docs/lib/utils";
import { useDocsNavigation } from "#ginko-docs/features/docs/composables/useDocsNavigation";
import { getDocsNavigationGroups } from "#ginko-docs/features/docs/docs-navigation";
import DocsSidebarItem from "./DocsSidebarItem.vue";
import { computed } from "vue";
import { useI18n } from "#imports";

const props = withDefaults(
  defineProps<{
    variant?: "desktop" | "drawer";
  }>(),
  {
    variant: "desktop",
  },
);

const { t } = useI18n();
const { sections } = await useDocsNavigation();
const sidebarSections = computed(() =>
  sections.value.map((section) => ({
    ...section,
    groups: getDocsNavigationGroups(section),
  })),
);

const scrollViewportClass =
  "min-h-0 flex-1 overflow-y-auto p-4 overscroll-contain [mask-image:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]";

const asideClass = computed(() =>
  cn(
    "flex h-full w-full flex-col text-sm transition-[border-color] duration-[250ms] ease-out *:w-full",
    props.variant === "desktop"
      ? "absolute inset-y-0 start-0 items-end border-e border-border"
      : "relative min-h-0 items-stretch border-e-0",
  ),
);
</script>

<template>
  <aside
    data-hovered="false"
    :data-variant="variant"
    :id="variant === 'desktop' ? 'nd-sidebar' : undefined"
    :aria-label="t('docs.label')"
    :class="asideClass"
  >
    <div :class="scrollViewportClass">
      <section
        v-for="(section, sectionIndex) in sidebarSections"
        :key="section.id"
        class="flex min-w-full flex-col gap-0.5"
        :class="sectionIndex > 0 ? 'mt-7 border-t border-border pt-6' : undefined"
      >
        <NuxtLink
          v-if="section.title && section.path"
          :to="section.path"
          class="mb-2 inline-flex items-center gap-2 px-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <Icon v-if="section.icon" :name="section.icon" class="size-3.5" aria-hidden="true" />
          {{ section.title }}
        </NuxtLink>
        <p
          v-else-if="section.title"
          class="mb-2 inline-flex items-center gap-2 px-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          <Icon v-if="section.icon" :name="section.icon" class="size-3.5" aria-hidden="true" />
          {{ section.title }}
        </p>

        <template v-for="group in section.groups" :key="group.id">
          <NuxtLink
            v-if="group.title && group.path"
            :to="group.path"
            class="mt-5 mb-1 inline-flex items-center gap-2 px-2 text-sm font-semibold text-foreground first:mt-0 [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Icon v-if="group.icon" :name="group.icon" class="size-4" aria-hidden="true" />
            {{ group.title }}
          </NuxtLink>
          <p
            v-else-if="group.title"
            class="mt-5 mb-1 inline-flex items-center gap-2 px-2 text-sm font-semibold text-foreground first:mt-0 [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Icon v-if="group.icon" :name="group.icon" class="size-4" aria-hidden="true" />
            {{ group.title }}
          </p>
          <DocsSidebarItem
            v-for="item in group.items"
            :key="item.path ?? item.title"
            :item="item"
            :depth="0"
          />
        </template>
      </section>
    </div>
  </aside>
</template>
