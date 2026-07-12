import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import darkPlus from "shiki/dist/themes/dark-plus.mjs";
import lightPlus from "shiki/dist/themes/light-plus.mjs";
import { contentComponentTags } from "./tags";
import { i18nPages } from "./i18n/routes";

const root = dirname(fileURLToPath(import.meta.url));
const app = join(root, "app");

export default defineNuxtConfig({
  build: {
    transpile: ["@lupinum/ginko-docs"],
  },
  $meta: { name: "ginko-docs" },
  compatibilityDate: "2025-07-15",
  alias: { "#ginko-docs": app },
  css: [join(app, "assets/css/tailwind.css"), join(app, "assets/css/prose.css")],
  modules: [
    join(root, "modules/feature-routing"),
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxtjs/i18n",
    "@lupinum/ginko-content",
    "@nuxt/image",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxtjs/color-mode",
    "@nuxtjs/mcp-toolkit",
  ],
  mcp: {
    name: "Ginko Docs",
    version: "0.1.0",
  },
  components: {
    dirs: [
      {
        path: join(app, "components/site"),
        pathPrefix: false,
        global: true,
        pattern: [
          "SiteBanner.vue",
          "SiteFooter.vue",
          "SiteHeader.vue",
          "SiteInteractionLayer.vue",
          "SiteLocaleSwitcher.vue",
          "SiteLogoMark.vue",
        ],
      },
      {
        path: join(app, "features/docs/components"),
        pathPrefix: false,
        global: true,
        pattern: "DocsSidebar.vue",
      },
      { path: join(app, "components/mdc"), pathPrefix: false, global: true },
      { path: join(app, "components/prose"), pathPrefix: false, global: true },
    ],
  },
  imports: { autoImport: false },
  colorMode: { classSuffix: "" },
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
    },
    families: [{ name: "Public Sans", provider: "google" }],
  },
  i18n: {
    customRoutes: "config",
    defaultLocale: "en",
    detectBrowserLanguage: false,
    pages: i18nPages,
    strategy: "prefix_except_default",
    vueI18n: join(root, "i18n/i18n.config.ts"),
  },
  content: {
    i18n: {
      translatedSlugs: true,
    },
    markdown: {
      plugins: [
        [
          "highlight",
          {
            preStyles: false,
            transformers: [transformerNotationDiff(), transformerNotationHighlight()],
            themes: { light: lightPlus, dark: darkPlus },
          },
        ],
        ["toc", { depth: 3, searchDepth: 3 }],
        "summary",
        ["footnotes", { label: "" }],
      ],
      tags: contentComponentTags,
      anchorLinks: { depth: 4, exclude: [1] },
    },
    search: { engine: "minisearch" },
    sitemap: true,
    agent: { routes: true, linkHeaders: true, markdownNegotiation: true, prerender: true },
  },
  sitemap: {
    excludeAppSources: ["nuxt:prerender"],
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [{ name: "color-scheme", content: "light dark" }],
    },
  },
  hooks: {
    "components:dirs"(dirs) {
      const defaultComponentsDir = join(app, "components").replaceAll("\\", "/");
      const filtered = dirs.filter((entry) => {
        const path = (typeof entry === "string" ? entry : entry.path).replaceAll("\\", "/");
        return path !== defaultComponentsDir;
      });
      dirs.splice(0, dirs.length, ...filtered);
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ["/llms.txt", "/llms-full.txt", "/sitemap.xml", "/robots.txt"],
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@lupinum/ginko-content",
        "@vueuse/core",
        "class-variance-authority",
        "clsx",
        "reka-ui",
        "tailwind-merge",
        "zod",
      ],
    },
    plugins: [tailwindcss()],
  },
});
