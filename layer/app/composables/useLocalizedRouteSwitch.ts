import { useRoute, useSwitchLocalePath } from "#imports";
import type { RouteLocationRaw } from "vue-router";
import { useContentRouteAlternates } from "./useContentRouteAlternates";
import { isLocaleCode } from "../../i18n/locales";

export function useLocalizedRouteSwitch() {
  const route = useRoute();
  const switchLocalePath = useSwitchLocalePath();
  const { current: alternates } = useContentRouteAlternates();

  function switchPathname(targetLocale: string) {
    if (!isLocaleCode(targetLocale)) {
      return route.path;
    }

    const configuredLocale = targetLocale as Parameters<typeof switchLocalePath>[0];
    return (
      alternates.value.find((alternate) => alternate.locale === targetLocale)?.path ||
      switchLocalePath(configuredLocale)
    );
  }

  function switchPath(targetLocale: string): RouteLocationRaw {
    return { path: switchPathname(targetLocale), query: route.query, hash: route.hash };
  }

  return {
    switchPath,
    switchPathname,
  };
}
