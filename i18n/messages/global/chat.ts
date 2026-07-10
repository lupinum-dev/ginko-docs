export const chat = {
  launcherLabel: { de: "Chat öffnen", en: "Open chat" },
  title: { de: "Chat", en: "Chat" },
  consentTitle: { de: "Chat erst nach Zustimmung laden", en: "Load chat after consent" },
  consentDescription: {
    de: "Der Chat kann Drittanbieter-Skripte oder Cookies verwenden und wird deshalb erst nach passender Freigabe geladen.",
    en: "Chat may use third-party scripts or cookies, so it loads only after the matching permission exists.",
  },
  providerTitle: { de: "Direkter Kontakt", en: "Direct contact" },
  providerDescription: {
    de: "Der direkte Chat ist aktuell nicht verfügbar. Nutze bitte den hinterlegten Kontaktweg.",
    en: "Direct chat is currently unavailable. Please use the configured contact option.",
  },
  providerReady: {
    de: "Der Chatanbieter darf geladen werden.",
    en: "The chat provider may be loaded.",
  },
  close: { de: "Schließen", en: "Close" },
} as const;
