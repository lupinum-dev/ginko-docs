import { computed } from "vue";
import { navigation } from "@lupinum/ginko-content/client";
import { useAsyncData, useI18n } from "#imports";

// Sync on purpose: the returned AsyncData is itself awaitable, so async callers
// still `await` it, while sync callers (e.g. the site header) read `data`
// reactively without suspending.
export function useDocsNavigationData() {
  const { locale } = useI18n();
  const navigationKey = computed(() => `docs-navigation:${locale.value}`);

  return useAsyncData(navigationKey, () =>
    navigation("docs", {
      locale: locale.value,
      select: ["icon", "badge", "sidebar"],
    }),
  );
}
