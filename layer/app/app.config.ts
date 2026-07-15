import type { GinkoDocsAppConfig } from "../shared/types/app-config";
export default {
  ginkoDocs: {
    site: {
      name: { en: "Ginko Docs", de: "Ginko Docs" },
      description: {
        en: "Beautiful documentation sites built with Nuxt and ginko-content.",
        de: "Schöne Dokumentations-Websites auf Basis von Nuxt und ginko-content.",
      },
      url: "http://localhost:3000",
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
      localeSwitcher: "dropdown",
    },
    social: {},
    feedback: { enabled: false },
    repository: undefined,
    landing: {
      eyebrow: {
        en: "Documentation for humans and agents",
        de: "Dokumentation für Menschen und Agenten",
      },
      title: {
        en: "Documentation that feels finished.",
        de: "Dokumentation, die sich fertig anfühlt.",
      },
      description: {
        en: "A focused Nuxt layer for fast, searchable, multilingual documentation sites.",
        de: "Ein fokussierter Nuxt-Layer für schnelle, durchsuchbare, mehrsprachige Dokumentations-Websites.",
      },
      primary: {
        label: { en: "Get started", de: "Erste Schritte" },
        to: { en: "/docs", de: "/de/dokumentation" },
      },
      features: [],
    },
  } satisfies GinkoDocsAppConfig,
};
