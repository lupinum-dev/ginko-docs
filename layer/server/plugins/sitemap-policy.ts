import { defineNitroPlugin } from "nitropack/runtime/plugin";
import { filterSitemapEntries } from "../utils/sitemap";

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("sitemap:resolved", (context) => {
    const content = useRuntimeConfig(context.event).content;
    context.urls = filterSitemapEntries(context.urls, {
      locales: content.locales,
      blogEnabled: Boolean(content.collections.blog),
    });
  });
});
