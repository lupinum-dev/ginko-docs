import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineNuxtModule } from "@nuxt/kit";
import { createJiti } from "jiti";

export default defineNuxtModule({
  meta: { name: "ginko-docs-feature-routing" },
  async setup(_options, nuxt) {
    const configPath = join(nuxt.options.rootDir, "content.config.ts");
    if (!existsSync(configPath)) return;

    const jiti = createJiti(import.meta.url, { interopDefault: true });
    const contentConfig = (await jiti.import(configPath, { default: true })) as {
      agent?: { site?: { locales?: string[] } };
      collections?: Record<string, unknown>;
    };
    const configuredLocales = contentConfig.agent?.site?.locales ?? [];
    const contentI18n = (nuxt.options.content as { i18n?: { translatedSlugs?: boolean } }).i18n;
    if (contentI18n) {
      contentI18n.translatedSlugs = configuredLocales.length > 1;
    }
    const blogEnabled = Boolean(contentConfig.collections?.blog);

    if (!blogEnabled) {
      nuxt.hook("pages:extend", (pages) => {
        for (let index = pages.length - 1; index >= 0; index -= 1) {
          const page = pages[index];
          if (page && (page.path === "/blog" || page.path.startsWith("/blog/"))) {
            pages.splice(index, 1);
          }
        }
      });

      const search = (nuxt.options.content as { search?: { collections?: string[] } }).search;
      if (search?.collections) {
        search.collections = search.collections.filter((collection) => collection !== "blog");
      }
    }
  },
});
