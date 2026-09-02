import site from "../site.json";

export default defineAppConfig({
  ginkoDocs: {
    theme: {
      neutral: "custom",
      primary: "custom",
    },
    site: {
      url: site.url,
      name: { en: "Ginko Docs", de: "Ginko Docs" },
      description: {
        en: "Documentation for the Ginko Docs Nuxt layer.",
        de: "Dokumentation für den Ginko-Docs-Nuxt-Layer.",
      },
      logo: { light: "/lupinum_light.svg", dark: "/lupinum_dark.svg" },
      docsSidebarSwitcher: "tabs",
      legalLinks: [
        {
          label: { en: "About", de: "Über Ginko Docs" },
          to: { en: "/about", de: "/de/ueber-ginko-docs" },
        },
        {
          label: { en: "Legal notice", de: "Impressum" },
          to: "https://lupinum.com/impressum",
        },
        {
          label: { en: "Privacy", de: "Datenschutz" },
          to: "https://lupinum.com/datenschutz",
        },
      ],
    },
    nav: { socialIcons: true },
    social: {
      github: "https://github.com/lupinum-dev/ginko-docs",
      discord: {
        href: "https://discord.gg/RPH6SeA36N",
        icon: "logos:discord-icon",
      },
    },
    feedback: { enabled: true },
    analytics: { plausible: { scriptId: "7B8poD6ZSLVeKsR3G6JHF" } },
    repository: {
      url: "https://github.com/lupinum-dev/ginko-docs",
      branch: "main",
      contentDirectory: "docs/content",
    },
    landing: {
      title: {
        en: "Publish documentation from Markdown.",
        de: "Veröffentliche Dokumentation aus Markdown.",
      },
      description: {
        en: "Add routed docs, search, English and German localization, SEO, and agent-readable output to a Nuxt 4 app.",
        de: "Ergänze eine Nuxt-4-App um Docs-Routen, Suche, englische und deutsche Inhalte, SEO und agentenlesbare Ausgabe.",
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
          layout: "wide",
          tabs: [
            {
              label: { en: "Nuxt", de: "Nuxt" },
              icon: "lucide:file-code-2",
              filename: "nuxt.config.ts",
              code: [
                "export default defineNuxtConfig({",
                '  extends: ["@lupinum/ginko-docs"],',
                "  ginkoDocs: {",
                "    syntaxHighlighting: {",
                "      themes: {",
                '        light: "material-theme-lighter",',
                '        dark: "material-theme-palenight",',
                "      },",
                "    },",
                "  },",
                "});",
              ].join("\n"),
            },
            {
              label: { en: "App", de: "App" },
              icon: "lucide:settings-2",
              filename: "app.config.ts",
              code: [
                "export default defineAppConfig({",
                "  ginkoDocs: {",
                "    theme: {",
                '      neutral: "custom",',
                '      primary: "custom",',
                '      codeBlocks: "adaptive",',
                "    },",
                "    site: {",
                '      name: { en: "My Docs" },',
                '      docsSidebarSwitcher: "tabs",',
                "    },",
                '    nav: { links: "auto" },',
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
                "description: Install the layer and publish your first page.",
                "icon: lucide:rocket",
                "---",
                "",
                "::steps",
                "### Install the layer",
                "Write Markdown and publish a clear first page.",
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
                "# Raw Markdown works on static and server deployments",
                "curl https://docs.example.com/raw/docs/getting-started.md",
                "",
                "# LLM catalogs are prerendered",
                "curl https://docs.example.com/llms.txt",
                "",
                "# Nitro deployments also expose the MCP server",
                "curl https://docs.example.com/mcp",
              ].join("\n"),
            },
          ],
        },
      },
      install: {
        command: "pnpm add -D @lupinum/ginko-docs@0.4.0-rc.8 @lupinum/ginko-content@1.0.0-beta.5",
      },
      features: [
        {
          title: { en: "33 canonical tags", de: "33 kanonische Tags" },
          description: {
            en: "Use callouts, steps, tabs, code groups, file trees, timelines, quizzes, and media in Markdown.",
            de: "Nutze Callouts, Schritte, Tabs, Code-Gruppen, Dateibäume, Timelines, Quizze und Medien in Markdown.",
          },
          icon: "lucide:blocks",
        },
        {
          title: { en: "Search built in", de: "Suche integriert" },
          description: {
            en: "⌘K command center with active-locale navigation and full-text content results.",
            de: "⌘K-Befehlszentrale mit Navigation und Volltexttreffern für die aktive Sprache.",
          },
          icon: "lucide:search",
        },
        {
          title: { en: "English and German routes", de: "Englische und deutsche Routen" },
          description: {
            en: "Pair translated documents while keeping public slugs, navigation, and locale fallback aligned.",
            de: "Verbinde Übersetzungen und halte öffentliche Slugs, Navigation und Sprach-Fallback aufeinander abgestimmt.",
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
          title: { en: "Repository links", de: "Repository-Links" },
          description: {
            en: "Give every documentation page direct edit and issue links from the configured GitHub repository.",
            de: "Verlinke von jeder Dokumentationsseite direkt zum Bearbeiten und Melden im konfigurierten GitHub-Repository.",
          },
          icon: "lucide:git-pull-request",
        },
      ],
      agent: {
        title: { en: "Your docs, readable by agents", de: "Deine Doku, lesbar für Agenten" },
        description: {
          en: "Raw Markdown and LLM catalogs work on every deployment. Nitro servers also add content negotiation and read-only MCP tools.",
          de: "Raw Markdown und LLM-Kataloge funktionieren bei jeder Bereitstellung. Nitro-Server ergänzen Content Negotiation und schreibgeschützte MCP-Tools.",
        },
        code: [
          "$ curl https://docs.example.com/raw/docs/setup.md",
          "",
          "# Setup",
          "Install the layer and publish the first page.",
          "",
          "$ curl https://docs.example.com/llms.txt",
          "# Ginko Docs",
          "> Documentation for the Ginko Docs Nuxt layer.",
        ].join("\n"),
      },
      cta: {
        title: {
          en: "Start with one Markdown page.",
          de: "Beginne mit einer Markdown-Seite.",
        },
        secondary: {
          label: { en: "Read the docs", de: "Doku lesen" },
          to: { en: "/docs", de: "/de/dokumentation" },
        },
      },
    },
  },
});
