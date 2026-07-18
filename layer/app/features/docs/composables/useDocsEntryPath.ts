import { computed } from "vue";
import { findFirstNavigationPage } from "@lupinum/ginko-content/navigation";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { useDocsNavigationData } from "./useDocsNavigationData";

export async function useDocsEntryPath() {
  const localizedPath = useLocalizedPath();
  const { data } = await useDocsNavigationData();

  return computed(
    () => findFirstNavigationPage(data.value ?? undefined)?.path ?? localizedPath("docs"),
  );
}
