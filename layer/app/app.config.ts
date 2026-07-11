import type { GinkoDocsAppConfig } from "../shared/types/app-config";
export default {
  ginkoDocs: {
    site: {
      name: "Ginko Docs",
      description: "Beautiful documentation sites built with Nuxt and ginko-content.",
      url: "http://localhost:3000",
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
      localeSwitcher: "dropdown",
      docsSidebarSwitcher: "tabs",
    },
    social: {},
    blog: false,
    feedback: { enabled: false },
    landing: {
      eyebrow: "Documentation for humans and agents",
      title: "Documentation that feels finished.",
      description: "A focused Nuxt layer for fast, searchable, multilingual documentation sites.",
      primary: { label: "Get started", to: "/docs" },
      features: [],
    },
  } satisfies GinkoDocsAppConfig,
};
