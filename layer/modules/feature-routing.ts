import { defineNuxtModule, installModule } from "@nuxt/kit";
import type {} from "@lupinum/ginko-content";
import type { LocaleCode } from "../i18n/locales";
import { defaultLocale, localeCodes, locales, localizedPath } from "../i18n/locales";
import { routeSlugs } from "../shared/route-slugs";

interface PageRoute {
  path: string;
}

function configuredLocaleCodes(configuredLocales: unknown) {
  if (!Array.isArray(configuredLocales)) return new Set<string>();
  return new Set(
    configuredLocales.flatMap((locale) => {
      if (typeof locale === "string") return [locale];
      return locale && typeof locale === "object" && typeof locale.code === "string"
        ? [locale.code]
        : [];
    }),
  );
}

function removeInactivePageLocales(
  pages: Record<string, unknown> | undefined,
  activeLocales: ReadonlySet<string>,
) {
  if (!pages || activeLocales.size === 0) return;

  for (const routeMap of Object.values(pages)) {
    if (!routeMap || typeof routeMap !== "object" || Array.isArray(routeMap)) continue;
    for (const locale of Object.keys(routeMap)) {
      if (!activeLocales.has(locale)) delete (routeMap as Record<string, unknown>)[locale];
    }
  }
}

export const blogFeedRoutes = (
  primaryLocale: LocaleCode = defaultLocale,
  activeLocales: ReadonlySet<string> = new Set(localeCodes),
) =>
  localeCodes
    .filter((locale) => activeLocales.has(locale))
    .map((locale) => `${localizedPath(locale, routeSlugs.blog[locale], primaryLocale)}/rss.xml`);

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
    const ginkoDocs = nuxt.options.ginkoDocs;
    const primaryLocale =
      ginkoDocs && typeof ginkoDocs === "object"
        ? (ginkoDocs.primaryLocale ?? defaultLocale)
        : defaultLocale;
    if (!locales.some((locale) => locale.code === primaryLocale)) {
      throw new Error(`Missing locale definition for ${primaryLocale}.`);
    }
    const activeLocales = configuredLocaleCodes(nuxt.options.i18n?.locales);
    removeInactivePageLocales(
      nuxt.options.i18n?.pages as Record<string, unknown> | undefined,
      activeLocales,
    );
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
      nitroConfig.prerender.routes.push(...blogFeedRoutes(primaryLocale, activeLocales));
    });
  },
});
