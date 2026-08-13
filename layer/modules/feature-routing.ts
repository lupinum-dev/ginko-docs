import { defineNuxtModule, installModule } from "@nuxt/kit";
import type {} from "@lupinum/ginko-content";
import { defaultLocale, localeCodes, locales, localizedPath } from "../i18n/locales";
import { routeSlugs } from "../shared/route-slugs";

interface PageRoute {
  path: string;
}

export const blogFeedRoutes = localeCodes.map(
  (locale) => `${localizedPath(locale, routeSlugs.blog[locale])}/rss.xml`,
);

export function removeBlogPages(pages: PageRoute[], blogEnabled: boolean) {
  if (blogEnabled) return;

  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const page = pages[index];
    if (page && (page.path === "/blog" || page.path.startsWith("/blog/"))) {
      pages.splice(index, 1);
    }
  }
}

export default defineNuxtModule({
  meta: { name: "ginko-docs-feature-routing" },
  async setup(_options, nuxt) {
    const fallback = locales.find((locale) => locale.code === defaultLocale);
    if (!fallback) throw new Error(`Missing locale definition for ${defaultLocale}.`);
    const configuredLocales = nuxt.options.i18n?.locales;
    if (!Array.isArray(configuredLocales) || configuredLocales.length === 0) {
      nuxt.options.i18n = {
        ...nuxt.options.i18n,
        locales: [{ code: fallback.code, language: fallback.language, name: fallback.name }],
      };
    } else if (configuredLocales.length > 1) {
      const fallbackIndex = configuredLocales.findIndex(
        (locale) =>
          typeof locale === "object" &&
          locale !== null &&
          locale.code === fallback.code &&
          locale.language === fallback.language &&
          locale.name === fallback.name,
      );
      if (fallbackIndex >= 0) configuredLocales.splice(fallbackIndex, 1);
    }
    await installModule("@nuxtjs/i18n");

    let blogEnabled = false;

    nuxt.hook("content:context", (context) => {
      blogEnabled = Boolean(context.collections.blog);
    });

    nuxt.hook("pages:extend", (pages) => {
      removeBlogPages(pages, blogEnabled);
    });

    // content:context runs before Nitro config is finalized, so the feed
    // routes only prerender when the consuming app enables the blog.
    nuxt.hook("nitro:config", (nitroConfig) => {
      if (!blogEnabled) return;
      nitroConfig.prerender ??= {};
      nitroConfig.prerender.routes ??= [];
      nitroConfig.prerender.routes.push(...blogFeedRoutes);
    });
  },
});
