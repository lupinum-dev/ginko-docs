import { defineNuxtModule } from "@nuxt/kit";
import type {} from "@lupinum/ginko-content";

interface PageRoute {
  path: string;
}

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
  },
});
