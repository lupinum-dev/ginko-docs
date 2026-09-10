import { defineEventHandler } from "h3";
import { defaultLocale, isLocaleCode } from "../../../i18n/locales";
import { serveBlogFeed } from "../../utils/blog-feed";

export default defineEventHandler((event) => {
  const configuredPrimaryLocale = useRuntimeConfig(event).public.ginkoDocs?.primaryLocale;
  return serveBlogFeed(
    event,
    typeof configuredPrimaryLocale === "string" && isLocaleCode(configuredPrimaryLocale)
      ? configuredPrimaryLocale
      : defaultLocale,
  );
});
