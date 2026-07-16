export const errors = {
  accessDenied: {
    title: { de: "Zugriff verweigert", en: "Access denied" },
    description: {
      de: "Diese Seite ist nicht fuer den oeffentlichen Zugriff freigegeben.",
      en: "This page is not available for public access.",
    },
  },
  actions: {
    contact: { de: "Kontakt aufnehmen", en: "Contact us" },
    docs: { de: "Dokumentation lesen", en: "Read the docs" },
    home: { de: "Zur Startseite", en: "Go home" },
    retry: { de: "Erneut versuchen", en: "Try again" },
  },
  notFound: {
    title: { de: "Seite nicht gefunden", en: "Page not found" },
    description: {
      de: "Die angeforderte Seite existiert nicht oder wurde verschoben.",
      en: "The requested page does not exist or has moved.",
    },
  },
  server: {
    title: { de: "Etwas ist schiefgelaufen", en: "Something went wrong" },
    description: {
      de: "Die Seite konnte gerade nicht geladen werden. Bitte versuche es spaeter erneut oder kontaktiere uns.",
      en: "The page could not be loaded right now. Please try again later or contact us.",
    },
  },
  unavailable: {
    title: { de: "Seite nicht verfuegbar", en: "Page unavailable" },
    description: {
      de: "Diese Anfrage konnte gerade nicht verarbeitet werden.",
      en: "This request could not be processed right now.",
    },
  },
} as const;
