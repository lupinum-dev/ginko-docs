import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import darkPlus from "shiki/dist/themes/dark-plus.mjs";
import lightPlus from "shiki/dist/themes/light-plus.mjs";
import { i18nPages, localizedRoutes } from "./i18n/routes";
import {
  defaultLocale,
  localeCodes,
  localeIconNames,
  locales,
  localizedPath,
  nonDefaultLocaleCodes,
} from "./i18n/locales";
import { siteConfig } from "./app/site.config";
import { resolveSiteUrl } from "./app/config/site.utils";

const isDev = process.env.NODE_ENV === "development";
const siteUrl = resolveSiteUrl(siteConfig.site.url);
const sitemapExcludedRoutes = localeCodes.flatMap((locale) =>
  (["thank-you", "websiteClarity"] as const).map((routeKey) =>
    localizedPath(locale, localizedRoutes[locale][routeKey]),
  ),
);
const prerenderIgnoredRoutePrefixes = ["/_nuxt/", "/_vercel/image"];
const contentLocaleFallback = Object.fromEntries(
  nonDefaultLocaleCodes.map((locale) => [locale, [defaultLocale]]),
);
const prerenderLocaleRoutes = localeCodes.map((locale) => localizedPath(locale, "/"));
const prerenderLlmsRoutes = localeCodes.flatMap((locale) => [
  localizedPath(locale, "/llms.txt"),
  localizedPath(locale, "/llms-full.txt"),
]);

const shouldSkipPrerenderRoute = (route: string) => {
  const pathname = route.split("?")[0] || route;

  return prerenderIgnoredRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
};

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  srcDir: "app",
  devtools: { enabled: isDev },
  experimental: {
    payloadExtraction: true,
  },
  site: {
    url: siteUrl,
  },
  sitemap: {
    exclude: sitemapExcludedRoutes,
  },
  robots: {
    groups: [
      {
        userAgent: "*",
        allow: "/",
        contentSignal: {
          search: siteConfig.agent.contentSignals.search ? "yes" : "no",
          "ai-input": siteConfig.agent.contentSignals.aiInput ? "yes" : "no",
          "ai-train": siteConfig.agent.contentSignals.aiTrain ? "yes" : "no",
        },
      },
    ],
  },
  css: ["~/assets/css/tailwind.css"],
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        { name: "theme-color", content: "#ffffff" },
        { name: "color-scheme", content: "light dark" },
        { name: "apple-mobile-web-app-title", content: "Lupinum" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  modules: [
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxt/scripts",
    "@nuxt/a11y",
    "@nuxt/hints",
    "@lupinum/content-components",
    "@nuxtjs/i18n",
    "@lupinum/ginko-content",
    "@nuxt/image",
    "@nuxt-photo/nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxtjs/color-mode",
  ],
  build: {
    transpile: ["@nuxt-photo/vue"],
  },
  icon: {
    clientBundle: {
      icons: localeIconNames,
    },
  },
  a11y: {
    enabled: isDev,
    defaultHighlight: false,
    logIssues: isDev,
    axe: {
      options: {},
      runOptions: {},
    },
  },
  hints: {
    devtools: isDev,
    features: {
      hydration: isDev,
      lazyLoad: false,
      webVitals: isDev,
      thirdPartyScripts: isDev,
      htmlValidate: isDev,
    },
  },
  nuxtPhoto: {
    css: "all",
    image: {
      thumb: {
        sizes: "calc(100vw - 2rem) sm:calc(50vw - 2rem) lg:360px",
        quality: 72,
      },
      slide: {
        widths: [480, 720, 960, 1240],
        maxWidth: 960,
        maxDensity: 1.3,
        sizes: "min(960px, calc(100vw - 2rem))",
        quality: 78,
      },
    },
  },
  image: {
    screens: {
      xs: 320,
      card: 360,
      cardLg: 384,
      content: 400,
      photoSm: 480,
      sm: 640,
      photoMd: 720,
      md: 768,
      contentLg: 800,
      hero: 900,
      photoLg: 960,
      lg: 1024,
      photoXl: 1240,
      xl: 1280,
      "2xl": 1536,
    },
    densities: [1],
  },
  colorMode: {
    classSuffix: "",
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        allowImportingTsExtensions: true,
      },
    },
  },
  i18n: {
    baseUrl: siteUrl,
    customRoutes: "config",
    defaultLocale,
    detectBrowserLanguage: false,
    pages: i18nPages,
    strategy: "prefix_except_default",
    locales: [...locales],
    vueI18n: "./i18n.config.ts",
  },
  fonts: {
    defaults: {
      weights: [400],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
    },
    families: [
      {
        name: "Pressura",
        provider: "local",
        weights: [300, 500, 700],
      },
    ],
  },
  imports: {
    autoImport: false,
  },
  components: {
    dirs: [
      {
        path: "~/components/marketing",
        pattern: "ConsentEmbed.vue",
        prefix: "Business",
        global: true,
        pathPrefix: false,
      },
      {
        path: "~/components/mdc",
        global: true,
        pathPrefix: false,
      },
    ],
  },
  hooks: {
    "components:dirs"(dirs) {
      const appComponentsPath = "/app/components";
      const allowedAppComponentPaths = [
        `${appComponentsPath}/marketing`,
        `${appComponentsPath}/mdc`,
      ];

      const explicitDirs = dirs.filter((dir) => {
        const dirPath = typeof dir === "string" ? dir : dir.path;
        const normalizedPath = dirPath.replaceAll("\\", "/");

        if (!normalizedPath.includes(appComponentsPath)) return true;
        return allowedAppComponentPaths.some((allowedPath) => normalizedPath.endsWith(allowedPath));
      });

      dirs.splice(0, dirs.length, ...explicitDirs);
    },
  },
  content: {
    i18n: {
      defaultLocale,
      locales: localeCodes,
      fallback: contentLocaleFallback,
      translatedSlugs: true,
    },
    links: {
      main: {
        services: { route: "services" },
        references: { route: "references" },
        contact: { route: "contact" },
        projectBrief: {
          route: "contact",
          query: {
            source: "docs",
            intent: "brief",
          },
        },
      },
    },
    markdown: {
      plugins: [
        [
          "highlight",
          {
            preStyles: false,
            transformers: [transformerNotationDiff(), transformerNotationHighlight()],
            themes: {
              light: lightPlus,
              dark: darkPlus,
            },
          },
        ],
        ["toc", { depth: 3, searchDepth: 3 }],
        "summary",
        ["footnotes", { label: "" }],
      ],
      tags: {
        "code-group": "MdcCodeGroup",
        chart: "MdcChart",
        gallery: "MdcGallery",
        "business-contact": "MdcBusinessContact",
        "business-imprint": "MdcBusinessImprint",
        "consent-embed": "BusinessConsentEmbed",
        "privacy-services": "MdcPrivacyServices",
      },
      anchorLinks: {
        depth: 4,
        exclude: [1],
      },
    },
    search: {
      engine: "minisearch",
      collections: ["docs", "blog", "services", "references"],
    },
    sitemap: true,
    agent: {
      routes: true,
      linkHeaders: true,
      markdownNegotiation: true,
      prerender: true,
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      ignore: [shouldSkipPrerenderRoute],
      routes: [...prerenderLocaleRoutes, ...prerenderLlmsRoutes, "/sitemap.xml", "/robots.txt"],
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@lupinum/ginko-content",
        "@vueuse/core",
        "class-variance-authority",
        "clsx",
        "motion-v",
        "reka-ui",
        "tailwind-merge",
        "zod",
      ],
    },
    plugins: [tailwindcss()],
  },
});
