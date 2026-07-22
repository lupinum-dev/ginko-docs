import type { GinkoDocsAppConfig } from "../shared/types/app-config";
export default {
  ginkoDocs: {
    prose: {
      appearance: "quiet",
      // Voice components keep the tint & bar DNA by default (RFC-001).
      components: {
        callout: "tint",
        aside: "tint",
        excerpt: "tint",
        tabs: "tint",
      },
    },
    site: {
      name: { en: "Ginko Docs", de: "Ginko Docs" },
      description: {
        en: "Documentation sites built with Nuxt and Ginko Content.",
        de: "Dokumentations-Sites auf Basis von Nuxt und Ginko Content.",
      },
      url: "http://localhost:3000",
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
      localeSwitcher: "dropdown",
      docsSidebarSwitcher: "tabs",
      lupinumAttribution: true,
    },
    nav: { links: "auto" },
    banner: {
      enabled: "auto",
      id: "default",
      showOnLanding: true,
    },
    social: {},
    feedback: { enabled: false },
    ogImage: { enabled: true, component: "GinkoDocs" },
    markdownActions: { chatGpt: true, claude: true, mcp: true },
    images: { zoom: true },
    toc: { depth: 3 },
    repository: undefined,
    landing: {
      eyebrow: {
        en: "Documentation for readers and agents",
        de: "Dokumentation für Leser und Agenten",
      },
      title: {
        en: "Publish structured documentation.",
        de: "Veröffentliche strukturierte Dokumentation.",
      },
      description: {
        en: "A Nuxt layer for searchable, localized documentation with stable routes and agent-readable output.",
        de: "Ein Nuxt-Layer für durchsuchbare, lokalisierte Dokumentation mit stabilen Routen und agentenlesbarer Ausgabe.",
      },
      primary: {
        label: { en: "Get started", de: "Erste Schritte" },
        to: { en: "/docs", de: "/de/dokumentation" },
      },
      features: [],
    },
  } satisfies GinkoDocsAppConfig,
};
