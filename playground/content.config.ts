import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";
import site from "./site.json" with { type: "json" };

export default defineGinkoDocsConfig({
  site: {
    name: { en: "Ginko Docs", de: "Ginko Docs" },
    description: {
      en: "Documentation for the Ginko Docs Nuxt layer.",
      de: "Dokumentation für den Ginko Docs Nuxt-Layer.",
    },
    url: site.url,
  },
  locales: ["en", "de"],
  blog: true,
});
