import { defineNuxtModule } from "@nuxt/kit";
import type {} from "@lupinum/ginko-content";
import { localeCodes, localizedPath } from "../i18n/locales";
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
  setup(_options, nuxt) {
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
