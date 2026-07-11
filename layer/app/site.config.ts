import { validateSiteConfig } from "./config/site.schema";
import { defaultLocale, localeCodes } from "../i18n/locales";

export const siteConfig = validateSiteConfig({
  site: {
    name: {
      de: "Lupinum",
      en: "Lupinum",
    },
    description: {
      de: "Schöne, mehrsprachige Dokumentations-Websites auf Basis von Nuxt und ginko-content.",
      en: "Beautiful, multilingual documentation sites built on Nuxt and ginko-content.",
    },
    url: "https://lupinum.com",
    defaultLocale,
    locales: localeCodes,
    localeSwitcher: "dropdown",
    docsSidebarSwitcher: "tabs",
    logo: {
      light: "/lupinum_light.svg",
      dark: "/lupinum_dark.svg",
    },
  },
  social: {
    github: "https://github.com/lupinum-dev",
  },
  blog: true,
  feedback: {
    enabled: false,
  },
  agent: {
    profile: "starter-docs",
    contentSignals: {
      search: true,
      aiInput: true,
      aiTrain: false,
    },
    markdown: {
      metadata: {
        enabled: true,
        defaultFields: [
          "title",
          "description",
          "url",
          "route",
          "locale",
          "section",
          "collection",
          "source",
          "updated",
        ],
      },
    },
    skills: {
      enabled: false,
      directory: "skills",
      legacyWellKnownAlias: false,
    },
  },
});
