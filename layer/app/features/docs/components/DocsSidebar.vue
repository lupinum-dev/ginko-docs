<script setup lang="ts">
import { cn } from "#ginko-docs/lib/utils";
import { useDocsNavigation } from "#ginko-docs/features/docs/composables/useDocsNavigation";
import DocsSidebarItem from "./DocsSidebarItem.vue";
import DocsSidebarDropdown from "./DocsSidebarDropdown.vue";
import DocsSidebarList from "./DocsSidebarList.vue";
import DocsSidebarTabs from "./DocsSidebarTabs.vue";
import { computed } from "vue";
import { navigateTo, useAppConfig, useI18n } from "#imports";

const props = withDefaults(
  defineProps<{
    variant?: "desktop" | "drawer";
  }>(),
  {
    variant: "desktop",
  },
);

const sidebarSwitcher = useAppConfig().ginkoDocs.site.docsSidebarSwitcher;
const { t } = useI18n();
const { sections, groups, activeSection } = await useDocsNavigation();

function setActiveSection(id: string) {
  activeSection.value = id;
  const sectionPath = sections.value.find((section) => section.id === id)?.path;
  if (sectionPath) void navigateTo(sectionPath);
}

const scrollViewportClass =
  "min-h-0 flex-1 overflow-y-auto p-4 pt-2 overscroll-contain [mask-image:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]";

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
    <div class="flex flex-col gap-3 p-4 pb-2">
      <DocsSidebarTabs
        v-if="sidebarSwitcher === 'tabs'"
        :sections="sections"
        :active-id="activeSection"
        @update:active-id="setActiveSection"
      />
      <DocsSidebarDropdown
        v-else-if="sidebarSwitcher === 'dropdown'"
        :sections="sections"
        :active-id="activeSection"
        @update:active-id="setActiveSection"
      />
      <DocsSidebarList
        v-else
        :sections="sections"
        :active-id="activeSection"
        @update:active-id="setActiveSection"
      />
    </div>

    <div :class="scrollViewportClass">
      <div class="flex min-w-full flex-col gap-0.5">
        <template v-for="group in groups" :key="group.id">
          <NuxtLink
            v-if="group.title && group.path"
            :to="group.path"
            class="mt-6 mb-1 inline-flex items-center gap-2 px-2 ps-2 text-sm font-semibold text-foreground first:mt-0 empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Icon v-if="group.icon" :name="group.icon" class="size-4 shrink-0" aria-hidden="true" />
            {{ group.title }}
          </NuxtLink>
          <p
            v-else-if="group.title"
            class="mt-6 mb-1 inline-flex items-center gap-2 px-2 ps-2 text-sm font-semibold text-foreground first:mt-0 empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Icon v-if="group.icon" :name="group.icon" class="size-4 shrink-0" aria-hidden="true" />
            {{ group.title }}
          </p>
          <DocsSidebarItem
            v-for="item in group.items"
            :key="item.path ?? item.title"
            :item="item"
            :depth="0"
          />
        </template>
      </div>
    </div>
  </aside>
</template>
