import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import darkPlus from "shiki/dist/themes/dark-plus.mjs";
import lightPlus from "shiki/dist/themes/light-plus.mjs";
import { contentComponentPolicy, contentComponentTags } from "./tags";
import { i18nPages } from "./i18n/routes";
import { localeCodes, localizedPath } from "./i18n/locales";
import { routeSlugs } from "./shared/route-slugs";
import { layerIconCollections, layerIconNames } from "./icon-bundle";

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
    "@nuxt/scripts",
    "nuxt-og-image",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxtjs/color-mode",
    "@nuxtjs/mcp-toolkit",
  ],
  ogImage: {
    zeroRuntime: true,
    // Satori renders queue up behind page prerendering on modest build
    // machines; the default 15s budget is too tight under that contention.
    security: { renderTimeout: 120_000 },
  },
  mcp: {
    name: "Ginko Docs",
    version: "0.2.5",
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
          "SiteSkipLink.vue",
          "SiteSocialLinks.vue",
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
  colorMode: { classSuffix: "" },
  icon: {
    provider: "none",
    fallbackToApi: false,
    customCollections: layerIconCollections,
    clientBundle: {
      icons: [...layerIconNames],
      includeCustomCollections: false,
      scan: {
        globInclude: [
          "**/*.{vue,js,mjs,cjs,ts,jsx,tsx,md,mdc,mdx,yml,yaml}",
          "**/.navigation.{yml,yaml}",
        ],
        globExclude: [
          ".git",
          ".nuxt",
          ".output",
          ".cache",
          "node_modules",
          "dist",
          "build",
          "coverage",
          "test",
          "tests",
        ],
      },
    },
  },
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
    },
    families: [{ name: "Public Sans", provider: "google", global: true }],
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
    componentPolicy: contentComponentPolicy,
    // Broken internal links and missing #anchors fail the build instead of
    // only landing in the validation report.
    validation: "error",
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
        ["toc", { depth: 4, searchDepth: 4 }],
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
    // The docs roots prerender as redirects to the first docs page; a sitemap
    // must not list redirecting URLs.
    exclude: localeCodes.map((locale) => localizedPath(locale, routeSlugs.docs[locale])),
  },
  app: {
    head: {
      charset: "utf-8",
      htmlAttrs: { lang: "en" },
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
      // OG images render through a Resvg worker. Parallel prerenders can
      // terminate that worker under load and leave otherwise valid pages with
      // 408/500 social-image routes, so package builds must stay serialized.
      concurrency: 1,
      crawlLinks: true,
      failOnError: true,
      routes: [
        "/llms.txt",
        "/llms-full.txt",
        "/sitemap.xml",
        "/robots.txt",
        // Link page over every authored redirectFrom source; crawling it
        // materializes the redirect stubs.
        "/api/_ginko-docs/redirects",
      ],
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@vueuse/core",
        "class-variance-authority",
        "clsx",
        "motion-v",
        "reka-ui",
        "tailwind-merge",
        "zod",
      ],
    },
    resolve: {
      dedupe: ["@lupinum/ginko-content", "vue", "vue-router"],
    },
    plugins: [tailwindcss()],
  },
});
