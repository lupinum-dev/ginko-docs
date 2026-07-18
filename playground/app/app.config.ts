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
    feedback: { enabled: true },
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
      hero: {
        media: {
          type: "code-tabs",
          tabs: [
            {
              label: { en: "Config", de: "Konfiguration" },
              icon: "lucide:settings-2",
              filename: "app.config.ts",
              code: [
                "export default defineAppConfig({",
                "  ginkoDocs: {",
                '    site: { name: { en: "My Docs" } },',
                '    nav: { links: "auto" },',
                '    docsSidebarSwitcher: "tabs",',
                "    analytics: {",
                '      plausible: { domain: "docs.example.com" },',
                "    },",
                "  },",
                "});",
              ].join("\n"),
            },
            {
              label: { en: "Content", de: "Inhalte" },
              icon: "lucide:file-text",
              filename: "1.getting-started.md",
              language: "md",
              code: [
                "---",
                "title: Getting started",
                "icon: lucide:rocket",
                "---",
                "",
                "::steps",
                ':::step{title="Install the layer"}',
                "Write Markdown, ship polished docs.",
                ":::",
                "::",
              ].join("\n"),
            },
            {
              label: { en: "Localize", de: "Lokalisieren" },
              icon: "lucide:languages",
              filename: "content/",
              language: "text",
              code: [
                "content/",
                "├── en/",
                "│   └── 1.docs/",
                "│       ├── .navigation.yml",
                "│       └── 1.getting-started.md",
                "└── de/",
                "    └── 1.dokumentation/",
                "        ├── .navigation.yml",
                "        └── 1.erste-schritte.md",
              ].join("\n"),
            },
            {
              label: { en: "Agents", de: "Agenten" },
              icon: "lucide:bot",
              filename: "terminal",
              language: "bash",
              code: [
                "# Every page negotiates Markdown for agents",
                "curl https://docs.example.com/docs/getting-started \\",
                '  -H "Accept: text/markdown"',
                "",
                "# llms.txt and llms-full.txt are generated",
                "curl https://docs.example.com/llms.txt",
                "",
                "# MCP server included",
                "curl https://docs.example.com/mcp",
              ].join("\n"),
            },
          ],
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
