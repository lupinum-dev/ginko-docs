import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";
export default defineGinkoDocsConfig({
  site: {
    name: { en: "Ginko Docs", de: "Ginko Docs" },
    description: {
      en: "Documentation for the Ginko Docs Nuxt layer.",
      de: "Dokumentation für den Ginko Docs Nuxt-Layer.",
    },
    whenToUse: {
      en: "Use this site to learn, configure, and operate Ginko Docs.",
      de: "Nutze diese Website, um Ginko Docs kennenzulernen, zu konfigurieren und zu betreiben.",
    },
    whenNotToUse: {
      en: "Do not use this site as documentation for Ginko Content.",
      de: "Nutze diese Website nicht als Dokumentation für Ginko Content.",
    },
  },
  agent: {
    pages: [
      {
        id: "home",
        route: { en: "/", de: "/de" },
        section: "optional",
        title: { en: "Ginko Docs", de: "Ginko Docs" },
        description: {
          en: "A Nuxt layer for searchable, localized, agent-readable documentation.",
          de: "Ein Nuxt-Layer für durchsuchbare, lokalisierte und agentenlesbare Dokumentation.",
        },
        render: ({ locale }) =>
          locale === "de"
            ? [
                "# Ginko Docs",
                "",
                "Ginko Docs verwandelt Markdown in eine vollständige Nuxt-Dokumentationsseite mit stabilen Routen, Suche, Lokalisierung, SEO und agentenlesbaren Ausgaben.",
                "",
                "- [Erste Schritte](/de/dokumentation/erste-schritte)",
                "- [Vollständige Agentenübersicht](/de/llms-full.txt)",
                "- [Über Ginko Docs](/de/ueber-ginko-docs)",
              ].join("\n")
            : [
                "# Ginko Docs",
                "",
                "Ginko Docs turns Markdown into a complete Nuxt documentation site with stable routes, search, localization, SEO, and agent-readable output.",
                "",
                "- [Get started](/docs/getting-started)",
                "- [Complete agent index](/llms-full.txt)",
                "- [About Ginko Docs](/about)",
              ].join("\n"),
      },
      {
        id: "about",
        route: { en: "/about", de: "/de/ueber-ginko-docs" },
        section: "optional",
        title: { en: "About Ginko Docs", de: "Über Ginko Docs" },
        description: {
          en: "What Ginko Docs is, who maintains it, and where to get help.",
          de: "Was Ginko Docs ist, wer es betreut und wo du Hilfe bekommst.",
        },
        render: ({ locale }) =>
          locale === "de"
            ? "# Über Ginko Docs\n\nGinko Docs ist ein Open-Source-Nuxt-Layer von Lupinum. Er hält Inhalte in Markdown und erzeugt daraus zugängliche Seiten für Menschen, Suchmaschinen und Software-Agenten. Das Repository, die Probleme und die Beiträge sind öffentlich.\n\n- [GitHub](https://github.com/lupinum-dev/ginko-docs)\n- [Kontakt zu Lupinum](https://lupinum.com/kontakt)\n- [Datenschutz](https://lupinum.com/datenschutz)"
            : "# About Ginko Docs\n\nGinko Docs is an open-source Nuxt layer maintained by Lupinum. It keeps content in Markdown and turns it into accessible pages for people, search engines, and software agents. Its repository, issues, and contribution path are public.\n\n- [GitHub](https://github.com/lupinum-dev/ginko-docs)\n- [Contact Lupinum](https://lupinum.com/kontakt)\n- [Privacy](https://lupinum.com/datenschutz)",
      },
    ],
  },
  locales: ["en", "de"],
  blog: true,
});
