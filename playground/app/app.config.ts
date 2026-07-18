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
      install: { command: "pnpm add @lupinum/ginko-docs" },
      features: [
        {
          title: { en: "40+ content components", de: "40+ Inhaltskomponenten" },
          description: {
            en: "Steps, tabs, code groups, file trees, quizzes, timelines — polished and accessible.",
            de: "Steps, Tabs, Code-Gruppen, Dateibäume, Quizze, Timelines — ausgereift und barrierefrei.",
          },
          icon: "lucide:blocks",
        },
        {
          title: { en: "Search built in", de: "Suche integriert" },
          description: {
            en: "⌘K command center with fuzzy full-text search across every page and heading.",
            de: "⌘K-Befehlszentrale mit unscharfer Volltextsuche über alle Seiten und Überschriften.",
          },
          icon: "lucide:search",
        },
        {
          title: { en: "Real localization", de: "Echte Lokalisierung" },
          description: {
            en: "Translated slugs, localized routes, locale fallback, and a coherent language switcher.",
            de: "Übersetzte Slugs, lokalisierte Routen, Sprach-Fallback und ein konsistenter Sprachwechsler.",
          },
          icon: "lucide:languages",
        },
        {
          title: { en: "SEO & OG images", de: "SEO & OG-Bilder" },
          description: {
            en: "Generated social cards, sitemap, robots, and canonical links out of the box.",
            de: "Generierte Social Cards, Sitemap, Robots und kanonische Links ab Werk.",
          },
          icon: "lucide:globe-2",
        },
        {
          title: { en: "Dark mode & theming", de: "Dark Mode & Theming" },
          description: {
            en: "Dual-theme code highlighting and design tokens that adapt to both color schemes.",
            de: "Code-Highlighting für beide Themes und Design-Tokens, die sich beiden Farbschemata anpassen.",
          },
          icon: "lucide:palette",
        },
        {
          title: { en: "Feedback & edit links", de: "Feedback & Bearbeiten" },
          description: {
            en: "Reader feedback and edit-on-GitHub links on every documentation page.",
            de: "Leser-Feedback und Auf-GitHub-bearbeiten-Links auf jeder Dokumentationsseite.",
          },
          icon: "lucide:messages-square",
        },
      ],
      agent: {
        title: { en: "Your docs, readable by agents", de: "Deine Doku, lesbar für Agenten" },
        description: {
          en: "Every page negotiates Markdown. llms.txt and an MCP server ship by default — no plugin, no config.",
          de: "Jede Seite liefert auf Wunsch Markdown. llms.txt und ein MCP-Server sind standardmäßig dabei — ohne Plugin, ohne Konfiguration.",
        },
        code: [
          "$ curl https://docs.example.com/docs/setup \\",
          '    -H "Accept: text/markdown"',
          "",
          "# Setup",
          "Install the layer, write Markdown, ship.",
          "",
          "$ curl https://docs.example.com/llms.txt",
          "# My Docs — llms.txt",
        ].join("\n"),
      },
      cta: {
        title: { en: "Ship your docs today.", de: "Bring deine Doku heute live." },
        secondary: {
          label: { en: "Read the docs", de: "Doku lesen" },
          to: { en: "/docs", de: "/de/dokumentation" },
        },
      },
    },
  },
};
