export const command = {
  title: { de: "Command Center", en: "Command center" },
  description: {
    de: "Navigation, Dokumentation und Aktionen durchsuchen.",
    en: "Search navigation, documentation, and shortcuts.",
  },
  placeholder: { de: "Docs, Seiten, Aktionen suchen...", en: "Search docs, pages, actions..." },
  noResults: { de: 'Keine Ergebnisse für "{query}"', en: 'No results for "{query}"' },
  noResultsHelp: {
    de: "Suche nach einem Seitentitel, Docs-Bereich oder Stichwort.",
    en: "Try searching for a page title, doc section, or keyword.",
  },
  clear: { de: "Suche löschen", en: "Clear search" },
  navigate: { de: "Navigieren", en: "Navigate" },
  open: { de: "Öffnen", en: "Open" },
  close: { de: "Schließen", en: "Close" },
  closeHint: { de: "Esc schließen", en: "Esc closes" },
  groups: {
    recent: { de: "Zuletzt", en: "Recent" },
    pages: { de: "Navigation", en: "Navigation" },
    docs_nav: { de: "Docs-Navigation", en: "Docs Navigation" },
    search: { de: "Suchergebnisse", en: "Search results" },
    actions: { de: "Aktionen", en: "Actions" },
  },
  loading: { de: "Suche läuft …", en: "Searching…" },
  resultCount: { de: "{count} Treffer", en: "{count} results" },
  error: {
    de: "Die Suche ist gerade nicht verfügbar. Versuche es erneut.",
    en: "Search is temporarily unavailable. Please try again.",
  },
  pages: {
    home: {
      title: { de: "Start", en: "Home" },
      description: {
        de: "Landingpage und Produktüberblick",
        en: "Landing page and product overview",
      },
    },
    primary: { de: "Hauptnavigation", en: "Primary navigation" },
    secondary: { de: "Weitere Seite", en: "Secondary page" },
    documentation: { de: "Dokumentationsbereich", en: "Documentation section" },
  },
  actions: {
    github: {
      title: { de: "GitHub öffnen", en: "Open GitHub" },
      description: { de: "Zum Projekt-Repository springen", en: "Jump to the project repository" },
    },
  },
} as const;
