import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";
import site from "./site.json" with { type: "json" };

export default defineGinkoDocsConfig({
  site: {
    name: "Ginko Docs",
    description: "A complete Nuxt documentation theme powered by ginko-content.",
    url: site.url,
  },
  locales: ["en", "de"],
  defaultLocale: "en",
  blog: true,
});
