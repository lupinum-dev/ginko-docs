import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";
export default defineGinkoDocsConfig({
  site: {
    name: { en: "Ginko Docs", de: "Ginko Docs" },
    description: {
      en: "Documentation for the Ginko Docs Nuxt layer.",
      de: "Dokumentation für den Ginko Docs Nuxt-Layer.",
    },
    whenToUse: {
      en: "Use this site to learn, configure, and operate Ginko Docs.",
      de: "Nutze diese Website, um Ginko Docs kennenzulernen, zu konfigurieren und zu betreiben.",
    },
    whenNotToUse: {
      en: "Do not use this site as documentation for Ginko Content.",
      de: "Nutze diese Website nicht als Dokumentation für Ginko Content.",
    },
  },
  locales: ["en", "de"],
  blog: true,
});
