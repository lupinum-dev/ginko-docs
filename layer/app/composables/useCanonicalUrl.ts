import { computed } from "vue";
import { useAppConfig, useRoute } from "#imports";

export function useCanonicalUrl() {
  const route = useRoute();
  const config = useAppConfig().ginkoDocs;

  return computed(() => new URL(route.path, config.site.url).toString());
}
