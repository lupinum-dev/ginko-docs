import site from "./site.json" with { type: "json" };

export default defineNuxtConfig({
  extends: ["../layer"],
  site: { url: site.url },
  i18n: {
    baseUrl: site.url,
    locales: [
      { code: "en", language: "en-US", name: "English" },
      { code: "de", language: "de-AT", name: "Deutsch" },
    ],
  },
  content: {
    componentPolicy: {
      components: {
        "release-status": {
          kind: "block",
          props: {
            channel: { type: "string", required: true },
            available: { type: "boolean", required: false },
          },
          slots: ["default"],
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
