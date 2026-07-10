export const cookie = {
  title: { de: "Wir verwenden Cookies", en: "We use cookies" },
  description: {
    de: "Wir nutzen notwendige Cookies für den Betrieb und optionale Cookies für Analyse und Komfort.",
    en: "We use necessary cookies to run the site and optional cookies for analytics and convenience.",
  },
  acceptAll: { de: "Alle akzeptieren", en: "Accept all" },
  rejectAll: { de: "Alle ablehnen", en: "Reject all" },
  manage: { de: "Einstellungen", en: "Manage" },
  settingsLink: { de: "Datenschutz-Einstellungen", en: "Privacy settings" },
  save: { de: "Auswahl speichern", en: "Save preferences" },
  preferencesTitle: { de: "Datenschutzeinstellungen", en: "Privacy Preferences" },
  policyTitle: { de: "Cookies? Genau.", en: "Guess what? Cookies!" },
  modalDescription: {
    de: "Beim Besuch einer Website können Informationen in deinem Browser gespeichert oder abgerufen werden, meist in Form von Cookies. Sie helfen dabei, dass die Website wie erwartet funktioniert.",
    en: "When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This helps the site work as you expect it to.",
  },
  dialogDescription: {
    de: "Wir verwenden notwendige Cookies für eine bessere Website-Erfahrung. Zusätzlich möchten wir optionale Cookies für Support und Analyse einsetzen.",
    en: "We use necessary cookies to offer you a better website experience. We would also like to use optional cookies for support and analytics.",
  },
  policyLink: { de: "Cookie-Richtlinie", en: "Cookie Policy" },
  necessary: { de: "Technisch notwendige Cookies", en: "Strictly Necessary Cookies" },
  necessaryDescription: {
    de: "Diese Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden.",
    en: "These cookies are necessary for the website to function and cannot be switched off.",
  },
  analytics: { de: "Analyse-Cookies", en: "Analytics Cookies" },
  analyticsDescription: {
    de: "Diese Cookies helfen uns, Besuche zu zählen und die Leistung der Website zu verbessern.",
    en: "These cookies allow us to count visits and improve the performance of our site.",
  },
  marketing: { de: "Marketing-Cookies", en: "Marketing Cookies" },
  marketingDescription: {
    de: "Diese Cookies können von Werbepartnern über unsere Website gesetzt werden.",
    en: "These cookies may be set through our site by advertising partners.",
  },
  close: { de: "Schließen", en: "Close" },
  rejectOptional: { de: "Optionale ablehnen", en: "Reject optional" },
  privacy: { de: "Datenschutz", en: "Privacy" },
  imprint: { de: "Impressum", en: "Imprint" },
  categories: {
    essential: {
      label: { de: "Technisch notwendige Cookies", en: "Strictly necessary cookies" },
      description: {
        de: "Diese Dienste sind fuer Betrieb, Sicherheit und aktiv abgesendete Formulare erforderlich und koennen nicht deaktiviert werden.",
        en: "These services are required for operation, security, and actively submitted forms and cannot be disabled.",
      },
    },
    analytics: {
      label: { de: "Analyse", en: "Analytics" },
      description: {
        de: "Analyse-Dienste messen Seitenaufrufe und Ereignisse, wenn sie in der Business-Konfiguration aktiviert sind.",
        en: "Analytics services measure page views and events when they are enabled in the business config.",
      },
    },
    marketing: {
      label: { de: "Marketing", en: "Marketing" },
      description: {
        de: "Marketing-Dienste wie Pixel oder Insight Tags werden nur nach Zustimmung geladen.",
        en: "Marketing services such as pixels or insight tags load only after consent.",
      },
    },
    support: {
      label: { de: "Support und Chat", en: "Support and chat" },
      description: {
        de: "Support-Dienste werden nur geladen, wenn das Projekt sie aktiviert und die passende Zustimmung vorliegt.",
        en: "Support services load only when the project enables them and the matching consent exists.",
      },
    },
    embeds: {
      label: { de: "Einbettungen", en: "Embeds" },
      description: {
        de: "Videos, Karten und Termin-Widgets werden erst nach Zustimmung direkt vom jeweiligen Anbieter geladen.",
        en: "Videos, maps, and scheduling widgets load directly from their provider only after consent.",
      },
    },
  },
} as const;
