import type { ContentAlternate } from "@lupinum/ginko-content/client";
import { computed, watch, type Ref } from "vue";
import { useRoute, useState } from "#imports";

type ContentRouteAlternatesState = {
  sourcePath: string;
  alternates: ContentAlternate[];
};

export function useContentRouteAlternates() {
  const route = useRoute();
  const state = useState<ContentRouteAlternatesState>("content-route-alternates", () => ({
    sourcePath: "",
    alternates: [],
  }));

  const current = computed(() =>
    state.value.sourcePath === route.path ? state.value.alternates : [],
  );

  return current;
}

export function syncContentRouteAlternates(
  page: Ref<{ route?: { alternates?: ContentAlternate[] } } | null | undefined>,
) {
  const route = useRoute();
  const state = useState<ContentRouteAlternatesState>("content-route-alternates", () => ({
    sourcePath: "",
    alternates: [],
  }));

  watch(
    page,
    (document) => {
      state.value = {
        sourcePath: route.path,
        alternates: document?.route?.alternates ?? [],
      };
    },
    { immediate: true },
  );
}
