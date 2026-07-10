export const forms = {
  contact: {
    fields: {
      company: { de: "Unternehmen", en: "Company" },
      email: { de: "E-Mail", en: "Email" },
      message: {
        de: "Was passt an Ihrer Website nicht mehr?",
        en: "What no longer fits on your website?",
      },
      name: { de: "Name", en: "Name" },
      phone: { de: "Telefon, optional", en: "Phone, optional" },
    },
    errors: {
      company: {
        de: "Bitte gib dein Unternehmen ein.",
        en: "Enter your company.",
      },
      email: {
        de: "Bitte gib eine gültige E-Mail-Adresse ein.",
        en: "Enter a valid email address.",
      },
      name: { de: "Bitte gib deinen Namen ein.", en: "Enter your name." },
      phone: {
        de: "Bitte gib eine gültige Telefonnummer ein oder lass das Feld leer.",
        en: "Enter a valid phone number or leave the field empty.",
      },
      privacyAccepted: {
        de: "Bitte bestätige die Datenschutzhinweise.",
        en: "Confirm the privacy notice.",
      },
    },
    privacyPrefix: { de: "Ich habe die", en: "I have read the" },
    privacyLink: { de: "Datenschutzhinweise", en: "privacy notice" },
    privacySuffix: {
      de: "gelesen und stimme der Verarbeitung meiner Anfrage zu.",
      en: "and agree that my inquiry may be processed.",
    },
    submit: { de: "Website-Check anfragen", en: "Request website check" },
    sending: { de: "Wird gesendet...", en: "Sending..." },
    submitErrorTitle: { de: "Senden fehlgeschlagen", en: "Sending failed" },
    submitErrorDescription: {
      de: "Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per E-Mail.",
      en: "Please try again or contact us directly by email.",
    },
  },
  leadMagnet: {
    fields: {
      company: { de: "Unternehmen", en: "Company" },
      email: { de: "E-Mail", en: "Email" },
      name: { de: "Name", en: "Name" },
    },
    errors: {
      email: {
        de: "Bitte gib eine gültige E-Mail-Adresse ein.",
        en: "Enter a valid email address.",
      },
      privacyAccepted: {
        de: "Bitte bestätige die Datenschutzhinweise.",
        en: "Confirm the privacy notice.",
      },
      resourceId: { de: "Die Download-Ressource fehlt.", en: "The download resource is missing." },
    },
    privacyPrefix: { de: "Ich habe die", en: "I have read the" },
    privacyLink: { de: "Datenschutzhinweise", en: "privacy notice" },
    privacySuffix: {
      de: "gelesen und stimme der Verarbeitung meiner Anfrage zu.",
      en: "and agree that my inquiry may be processed.",
    },
    submit: { de: "Download anfordern", en: "Request download" },
    sending: { de: "Wird gesendet...", en: "Sending..." },
    downloadLabel: { de: "Lead-Magnet", en: "Lead magnet" },
    successTitle: { de: "Download angefordert", en: "Download requested" },
    successDescription: {
      de: "Wir senden dir die angeforderte Ressource an die angegebene Adresse.",
      en: "We will send the requested resource to the provided address.",
    },
    submitErrorTitle: { de: "Senden fehlgeschlagen", en: "Sending failed" },
    submitErrorDescription: {
      de: "Bitte versuche es erneut oder kontaktiere uns direkt per E-Mail.",
      en: "Try again or contact us directly by email.",
    },
  },
} as const;
