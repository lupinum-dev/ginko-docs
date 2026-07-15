import { computed } from "vue";
import { useRoute } from "#imports";
import {
  findDocsNavigationTrail,
  getDocsNavigationSections,
  isDocsNavigationRoot,
  normalizeDocsNavigationItem,
  type DocsNavigationSection,
  type RawDocsTreeItem,
} from "../docs-navigation";
import { useDocsNavigationData } from "./useDocsNavigationData";

export async function useDocsNavigation() {
  const route = useRoute();
  const { data } = await useDocsNavigationData();

  const roots = computed(() => {
    const normalized = ((data.value ?? []) as RawDocsTreeItem[]).map(normalizeDocsNavigationItem);
    const root = normalized.find(isDocsNavigationRoot);
    return root?.children?.length ? root.children : normalized;
  });

  const sections = computed<DocsNavigationSection[]>(() => {
    return getDocsNavigationSections(roots.value);
  });

  const trail = computed(() => findDocsNavigationTrail(roots.value, route.path));

  return {
    sections,
    trail,
  };
}
