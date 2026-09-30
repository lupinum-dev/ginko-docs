import { computed } from "vue";
import { findNavigationTrail, normalizeNavigationPath } from "@lupinum/ginko-content/navigation";
import { useRoute } from "#imports";
import {
  getDocsNavigationSections,
  normalizeDocsNavigationItem,
  type DocsNavigationSection,
} from "../features/docs/docs-navigation";
import { useDocsNavigationData } from "../features/docs/composables/useDocsNavigationData";

import { useLocalizedPath } from "./useLocalizedPath";

export async function useDocsNavigation() {
  const route = useRoute();
  const localizedPath = useLocalizedPath();
  const { data } = await useDocsNavigationData();

  const roots = computed(() => {
    return (data.value ?? []).map((item, index) => normalizeDocsNavigationItem(item, index));
  });

  const sections = computed<DocsNavigationSection[]>(() => {
    return getDocsNavigationSections(roots.value);
  });

  const breadcrumbs = computed(() => findNavigationTrail(roots.value, route.path));

  const current = computed(() => {
    const item = breadcrumbs.value.at(-1);
    return item?.path && normalizeNavigationPath(item.path) === normalizeNavigationPath(route.path)
      ? item
      : undefined;
  });
  const rootPath = computed(() => localizedPath("docs"));

  return {
    sections,
    tree: roots,
    breadcrumbs,
    current,
    rootPath,
  };
}
