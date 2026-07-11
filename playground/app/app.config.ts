export default {
  ginkoDocs: {
    site: {
      url: "https://ginko-docs.lupinum.com",
      name: "Ginko Docs",
      description: "A complete Nuxt documentation theme powered by ginko-content.",
      logo: { light: "/lupinum_light.svg", dark: "/lupinum_dark.svg" },
    },
    social: { github: "https://github.com/lupinum-dev/ginko-docs" },
    blog: true,
    landing: {
      eyebrow: "Nuxt documentation, without the busywork",
      title: "Beautiful docs from Markdown.",
      description:
        "Navigation, search, localization, dark mode, agent routes, and polished content components—ready by default.",
      primary: { label: "Get started", to: "/docs/getting-started" },
      secondary: { label: "View on GitHub", to: "https://github.com/lupinum-dev/ginko-docs" },
      features: [
        {
          title: "Content first",
          description:
            "Write Markdown while the theme handles navigation, search, and responsive layouts.",
          icon: "lucide:file-text",
        },
        {
          title: "International",
          description: "Ship localized routes and content with a coherent language switcher.",
          icon: "lucide:languages",
        },
        {
          title: "Agent ready",
          description: "LLMs routes and Markdown negotiation are part of the default contract.",
          icon: "lucide:bot",
        },
      ],
    },
  },
};
