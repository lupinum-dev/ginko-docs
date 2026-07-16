import { useI18n } from "#imports";
import { isLocaleCode, localizedPath } from "../../i18n/locales";
import type { LocalizedRouteKey } from "../../i18n/routes";

export function useLocalizedPath() {
  const { locale, t } = useI18n();

  return (key: LocalizedRouteKey) => {
    const path = t(`routes.${key}`);
    return isLocaleCode(locale.value) ? localizedPath(locale.value, path) : path;
  };
}
