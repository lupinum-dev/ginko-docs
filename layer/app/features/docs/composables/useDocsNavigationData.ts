import { computed } from "vue";
import { navigation } from "@lupinum/ginko-content/client";
import { useAsyncData, useI18n } from "#imports";

export async function useDocsNavigationData() {
  const { locale } = useI18n();
  const navigationKey = computed(() => `docs-navigation:${locale.value}`);

  return useAsyncData(
    navigationKey,
    () =>
      navigation("docs", {
        locale: locale.value,
        select: ["icon", "badge", "sidebar"],
      }),
    { watch: [locale] },
  );
}
