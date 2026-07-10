import { computed } from "vue";
import { useContentNavigation } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";

export async function useDocsEntryPath() {
  const localizedPath = useLocalizedPath();
  const { firstPage } = await useContentNavigation("docs");

  return computed(() => firstPage.value?.path ?? localizedPath("docs"));
}
