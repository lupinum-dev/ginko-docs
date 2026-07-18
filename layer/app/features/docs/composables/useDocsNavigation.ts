import { computed } from "vue";
import { findNavigationTrail } from "@lupinum/ginko-content/navigation";
import { useRoute } from "#imports";
import {
  getDocsNavigationSections,
  normalizeDocsNavigationItem,
  type DocsNavigationSection,
} from "../docs-navigation";
import { useDocsNavigationData } from "./useDocsNavigationData";

export async function useDocsNavigation() {
  const route = useRoute();
  const { data } = await useDocsNavigationData();

  const roots = computed(() => {
    return (data.value ?? []).map((item, index) => normalizeDocsNavigationItem(item, index));
  });

  const sections = computed<DocsNavigationSection[]>(() => {
    return getDocsNavigationSections(roots.value);
  });

  const trail = computed(() => findNavigationTrail(roots.value, route.path));

  return {
    sections,
    trail,
  };
}
