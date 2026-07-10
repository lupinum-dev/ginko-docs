import { useContentSwitchLocalePath, useRoute, useSwitchLocalePath } from "#imports";
import { isLocaleCode } from "../../i18n/locales";

export function useLocalizedRouteSwitch() {
  const route = useRoute();
  const switchLocalePath = useSwitchLocalePath();
  const switchContentLocalePath = useContentSwitchLocalePath();

  function switchPath(targetLocale: string) {
    if (!isLocaleCode(targetLocale)) return route.path;
    return switchContentLocalePath(targetLocale) || switchLocalePath(targetLocale);
  }

  return {
    switchPath,
  };
}
