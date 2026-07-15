import site from "../site.json" with { type: "json" };

export default {
  ginkoDocs: {
    site: {
      url: site.url,
      name: { en: "Ginko Docs", de: "Ginko Docs" },
      description: {
        en: "A complete Nuxt documentation theme powered by ginko-content.",
        de: "Ein vollständiges Nuxt-Dokumentationstheme auf Basis von ginko-content.",
      },
      logo: { light: "/lupinum_light.svg", dark: "/lupinum_dark.svg" },
      docsSidebarSwitcher: "tabs",
    },
    social: { github: "https://github.com/lupinum-dev/ginko-docs" },
    repository: {
      url: "https://github.com/lupinum-dev/ginko-docs",
      branch: "main",
      contentDirectory: "playground/content",
    },
    landing: {
      eyebrow: {
        en: "Nuxt documentation, without the busywork",
        de: "Nuxt-Dokumentation ohne unnötige Handarbeit",
      },
      title: { en: "Beautiful docs from Markdown.", de: "Schöne Dokumentation aus Markdown." },
      description: {
        en: "Navigation, search, localization, dark mode, agent routes, and polished content components—ready by default.",
        de: "Navigation, Suche, Lokalisierung, Dark Mode, Agent-Routen und ausgereifte Inhaltskomponenten—standardmäßig einsatzbereit.",
      },
      primary: {
        label: { en: "Get started", de: "Erste Schritte" },
        to: { en: "/docs/getting-started", de: "/de/dokumentation/erste-schritte" },
      },
      secondary: {
        label: { en: "View on GitHub", de: "Auf GitHub ansehen" },
        to: {
          en: "https://github.com/lupinum-dev/ginko-docs",
          de: "https://github.com/lupinum-dev/ginko-docs",
        },
      },
      features: [
        {
          title: { en: "Content first", de: "Inhalte zuerst" },
          description: {
            en: "Write Markdown while the theme handles navigation, search, and responsive layouts.",
            de: "Schreibe Markdown, während das Theme Navigation, Suche und responsive Layouts übernimmt.",
          },
          icon: "lucide:file-text",
        },
        {
          title: { en: "International", de: "International" },
          description: {
            en: "Ship localized routes and content with a coherent language switcher.",
            de: "Veröffentliche lokalisierte Routen und Inhalte mit einem konsistenten Sprachwechsler.",
          },
          icon: "lucide:languages",
        },
        {
          title: { en: "Agent ready", de: "Agentenbereit" },
          description: {
            en: "LLMs routes and Markdown negotiation are part of the default contract.",
            de: "LLM-Routen und Markdown-Aushandlung gehören zum Standardvertrag.",
          },
          icon: "lucide:bot",
        },
      ],
    },
  },
};
