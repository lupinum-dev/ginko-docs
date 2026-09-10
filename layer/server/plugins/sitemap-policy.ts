import { defineNitroPlugin } from "nitropack/runtime/plugin";
import { filterSitemapEntries } from "../utils/sitemap";
import { defaultLocale, isLocaleCode } from "../../i18n/locales";

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("sitemap:resolved", (context) => {
    const runtimeConfig = useRuntimeConfig(context.event);
    const content = runtimeConfig.content;
    const configuredPrimaryLocale = runtimeConfig.public.ginkoDocs?.primaryLocale;
    context.urls = filterSitemapEntries(context.urls, {
      locales: content.locales,
      blogEnabled: Boolean(content.collections.blog),
      primaryLocale:
        typeof configuredPrimaryLocale === "string" && isLocaleCode(configuredPrimaryLocale)
          ? configuredPrimaryLocale
          : defaultLocale,
    });
  });
});
