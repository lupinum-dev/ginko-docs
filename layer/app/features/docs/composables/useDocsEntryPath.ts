import { computed } from "vue";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { firstDocsNavigationPath } from "../docs-navigation";
import { useDocsNavigationData } from "./useDocsNavigationData";

export async function useDocsEntryPath() {
  const localizedPath = useLocalizedPath();
  const { data } = await useDocsNavigationData();

  return computed(() => firstDocsNavigationPath(data.value ?? undefined) ?? localizedPath("docs"));
}
