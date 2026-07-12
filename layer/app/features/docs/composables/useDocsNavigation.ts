import { computed, watch } from "vue";
import { useRoute, useState } from "#imports";
import {
  docsNavigationItemContainsPath,
  findDocsNavigationTrail,
  getDocsNavigationGroups,
  isDocsNavigationRoot,
  normalizeDocsNavigationItem,
  type DocsNavigationSection,
  type RawDocsTreeItem,
} from "../docs-navigation";
import { useDocsNavigationData } from "./useDocsNavigationData";

export async function useDocsNavigation() {
  const route = useRoute();
  const selectedSectionId = useState<string>("docsSelectedSection", () => "");
  const selectedSectionRoute = useState<string>("docsSelectedSectionRoute", () => "");
  const { data } = await useDocsNavigationData();

  const roots = computed(() => {
    const normalized = ((data.value ?? []) as RawDocsTreeItem[]).map(normalizeDocsNavigationItem);
    const root = normalized.find(isDocsNavigationRoot);
    return root?.children?.length ? root.children : normalized;
  });

  const sections = computed<DocsNavigationSection[]>(() => {
    const explicit = roots.value.filter((item) => item.sidebar === "section");
    return explicit.length
      ? explicit
      : roots.value.filter((item) => item.path || item.children.length);
  });

  const routeSection = computed(() =>
    sections.value.find((section) => docsNavigationItemContainsPath(section, route.path)),
  );

  const fallbackSectionId = computed(() => sections.value[0]?.id || "");
  const routeSectionId = computed(() => routeSection.value?.id || fallbackSectionId.value);
  const userSelectedSectionId = computed(() =>
    selectedSectionRoute.value === route.path ? selectedSectionId.value : "",
  );

  watch(
    () => route.path,
    () => {
      selectedSectionRoute.value = "";
      selectedSectionId.value = "";
    },
  );

  const activeSection = computed({
    get: () => userSelectedSectionId.value || routeSectionId.value,
    set: (id: string) => {
      selectedSectionId.value = id;
      selectedSectionRoute.value = route.path;
    },
  });

  const activeSectionItem = computed(
    () => sections.value.find((section) => section.id === activeSection.value) ?? sections.value[0],
  );

  const groups = computed(() => getDocsNavigationGroups(activeSectionItem.value));
  const trail = computed(() => findDocsNavigationTrail(sections.value, route.path));

  return {
    sections,
    groups,
    activeSection,
    trail,
  };
}
