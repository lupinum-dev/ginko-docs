import site from "./site.json" with { type: "json" };

export default defineNuxtConfig({
  extends: ["../layer"],
  ginkoDocs: {
    syntaxHighlighting: {
      themes: {
        light: "material-theme-lighter",
        dark: "material-theme-palenight",
      },
    },
  },
  site: { url: site.url },
  i18n: {
    baseUrl: site.url,
    locales: [
      { code: "en", language: "en-US", name: "English" },
      { code: "de", language: "de-AT", name: "Deutsch" },
    ],
    pages: {
      about: { en: "/about", de: "/ueber-ginko-docs" },
    },
  },
  content: {
    componentPolicy: {
      version: 2,
      components: {
        "release-status": {
          kind: "block",
          props: {
            channel: { types: ["string"], required: true, allowedValues: null },
            available: { types: ["boolean"], required: false, allowedValues: null },
          },
          slots: ["default"],
          allowedParents: null,
          allowedChildren: null,
          media: null,
        },
      },
    },
    i18n: {
      fallback: { de: ["en"] },
    },
    markdown: {
      tags: {
        "release-status": "MdcReleaseStatus",
      },
    },
  },
});
