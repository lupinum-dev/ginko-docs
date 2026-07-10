import { computed } from "vue";
import { siteConfig } from "@/site.config";
import { useRoute } from "#imports";

export function useCanonicalUrl() {
  const route = useRoute();

  return computed(() => new URL(route.path, siteConfig.site.url).toString());
}
