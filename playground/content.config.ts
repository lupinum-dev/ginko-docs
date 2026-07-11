import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";

export default defineGinkoDocsConfig({
  site: {
    name: "Ginko Docs",
    description: "A complete Nuxt documentation theme powered by ginko-content.",
    url: "https://docs.example.com",
  },
  locales: ["en", "de"],
  defaultLocale: "en",
  blog: true,
});
