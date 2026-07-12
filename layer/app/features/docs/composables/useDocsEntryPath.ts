import { computed } from "vue";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { useDocsNavigationData } from "./useDocsNavigationData";

export async function useDocsEntryPath() {
  const localizedPath = useLocalizedPath();
  const { data } = await useDocsNavigationData();
  const firstPage = computed(() => data.value?.[0]);

  return computed(() => firstPage.value?.path ?? localizedPath("docs"));
}
