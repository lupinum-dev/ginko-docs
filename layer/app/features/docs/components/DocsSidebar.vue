<script setup lang="ts">
import { cn } from "#ginko-docs/lib/utils";
import { useDocsNavigation } from "#ginko-docs/features/docs/composables/useDocsNavigation";
import { findFirstNavigationPage } from "@lupinum/ginko-content/client";
import {
  docsNavigationSectionContainsPath,
  getDocsNavigationGroups,
  type DocsNavigationSection,
} from "#ginko-docs/features/docs/docs-navigation";
import DocsSidebarItem from "./DocsSidebarItem.vue";
import DocsSidebarDropdown from "./DocsSidebarDropdown.vue";
import DocsSidebarList from "./DocsSidebarList.vue";
import DocsSidebarTabs from "./DocsSidebarTabs.vue";
import { computed, ref, watch } from "vue";
import { navigateTo, useAppConfig, useI18n, useRoute } from "#imports";

const props = withDefaults(
  defineProps<{
    variant?: "desktop" | "drawer";
  }>(),
  {
    variant: "desktop",
  },
);

const { t } = useI18n();
const route = useRoute();
const sidebarSwitcher = useAppConfig().ginkoDocs.site.docsSidebarSwitcher;
const { sections } = await useDocsNavigation();
const switcherSections = computed(() =>
  sections.value.filter((section): section is DocsNavigationSection & { title: string } =>
    Boolean(section.title),
  ),
);
const selectedSectionId = ref("");
const routeSection = computed(() =>
  sections.value.find((section) => docsNavigationSectionContainsPath(section, route.path)),
);
const activeSectionId = computed(
  () => selectedSectionId.value || routeSection.value?.id || sections.value[0]?.id || "",
);
const activeSection = computed(
  () => sections.value.find((section) => section.id === activeSectionId.value) ?? sections.value[0],
);
const groups = computed(() =>
  activeSection.value ? getDocsNavigationGroups(activeSection.value) : [],
);

watch(
  () => route.path,
  () => {
    selectedSectionId.value = "";
  },
);

function setActiveSection(id: string) {
  selectedSectionId.value = id;
  const section = sections.value.find((entry) => entry.id === id);
  // Structural sections have no page of their own — land on their first page
  // instead of only swapping the sidebar contents.
  const path = section?.path ?? findFirstNavigationPage(section?.items)?.path;
  if (path) void navigateTo(path);
}

const scrollViewportClass =
  "min-h-0 flex-1 overflow-y-auto px-4 pb-4 overscroll-contain [mask-image:linear-gradient(to_bottom,transparent,white_12px,white_calc(100%-12px),transparent)]";

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
    <div v-if="switcherSections.length > 1" class="flex flex-col gap-3 p-4 pb-2">
      <DocsSidebarTabs
        v-if="sidebarSwitcher === 'tabs'"
        :sections="switcherSections"
        :active-id="activeSectionId"
        @update:active-id="setActiveSection"
      />
      <DocsSidebarDropdown
        v-else-if="sidebarSwitcher === 'dropdown'"
        :sections="switcherSections"
        :active-id="activeSectionId"
        @update:active-id="setActiveSection"
      />
      <DocsSidebarList
        v-else
        :sections="switcherSections"
        :active-id="activeSectionId"
        @update:active-id="setActiveSection"
      />
    </div>

    <div
      :class="[scrollViewportClass, switcherSections.length > 1 ? 'pt-2' : 'pt-4']"
      :data-switcher="switcherSections.length > 1"
    >
      <div class="flex min-w-full flex-col gap-0.5">
        <template v-for="group in groups" :key="group.id">
          <p
            v-if="group.title"
            class="mt-6 mb-1 inline-flex items-center gap-2 px-2 text-sm font-semibold text-foreground first:mt-0"
          >
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
