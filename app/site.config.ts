import { validateSiteConfig } from "./config/site.schema";
import { defaultLocale, localeCodes } from "../i18n/locales";

export const siteConfig = validateSiteConfig({
  site: {
    name: {
      de: "Lupinum",
      en: "Lupinum",
    },
    description: {
      de: "Lupinum entwickelt B2B-Websites für spezialisierte Unternehmen, die online klarer verstanden werden, Vertrauen aufbauen und bessere Anfragen vorbereiten wollen.",
      en: "Lupinum develops B2B websites for specialized companies that want to be understood more clearly online, build trust, and prepare better inquiries.",
    },
    url: "https://lupinum.com",
    defaultLocale,
    locales: localeCodes,
    localeSwitcher: "dropdown",
    docsSidebarSwitcher: "tabs",
    logo: {
      light: "/lupinum_light.svg",
      dark: "/lupinum_dark.svg",
    },
  },
  identity: {
    legalName: "Lupinum OG",
    brandName: "Lupinum",
    type: "ProfessionalService",
    countryProfile: "AT",
    vatId: "ATU80979201",
    registry: "FN 629500 k",
    registryCourt: "Handelsgericht St. Pölten",
    managingDirectors: [],
  },
  contact: {
    email: "info@lupinum.com",
    privacyEmail: "info@lupinum.com",
    legalEmail: "info@lupinum.com",
    phone: "+43 681 20303240",
    address: {
      street: "Innerzaun 26/1",
      postalCode: "3321",
      city: "Kollmitzberg",
      country: "Österreich",
      countryCode: "AT",
    },
  },
  social: {},
  analytics: {
    plausible: {
      enabled: false,
      consentCategory: "analytics",
      consentMode: false,
      domain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN,
    },
    ga4: {
      enabled: false,
      consentCategory: "analytics",
      consentMode: true,
      id: process.env.NUXT_PUBLIC_GA4_ID,
    },
    gtm: {
      enabled: false,
      consentCategory: "analytics",
      consentMode: true,
      id: process.env.NUXT_PUBLIC_GTM_ID,
    },
  },
  marketing: {
    metaPixel: {
      enabled: false,
      consentCategory: "marketing",
      id: process.env.NUXT_PUBLIC_META_PIXEL_ID,
    },
    linkedinInsight: {
      enabled: false,
      consentCategory: "marketing",
      id: process.env.NUXT_PUBLIC_LINKEDIN_INSIGHT_ID,
    },
  },
  embeds: {
    youtube: {
      enabled: false,
      consentCategory: "embeds",
    },
    vimeo: {
      enabled: false,
      consentCategory: "embeds",
    },
    googleMaps: {
      enabled: false,
      consentCategory: "embeds",
    },
    calCom: {
      enabled: false,
      consentCategory: "embeds",
    },
    calendly: {
      enabled: false,
      consentCategory: "embeds",
    },
  },
  forms: {
    provider: "basin",
    testEndpoint: process.env.BASIN_TEST_ENDPOINT,
    endpoints: {
      contact: {
        provider: "basin",
        productionEndpoint: process.env.BASIN_CONTACT_ENDPOINT,
      },
      leadMagnet: {
        provider: "basin",
        productionEndpoint: process.env.BASIN_LEAD_MAGNET_ENDPOINT,
      },
    },
  },
  chat: {
    enabled: false,
    provider: "none",
    consentCategory: "support",
    availability: {
      de: "Wir sind werktags erreichbar und melden uns zeitnah zurück.",
      en: "We are available on business days and will get back to you promptly.",
    },
    fallbackLabel: {
      de: "Kontakt aufnehmen",
      en: "Contact us",
    },
    fallbackMethod: "contact-page",
    fallbackEmail: "info@lupinum.com",
    providerId: process.env.NUXT_PUBLIC_CHAT_PROVIDER_ID,
  },
  legal: {
    jurisdiction: {
      de: "Österreich",
      en: "Austria",
    },
    lastUpdated: "2025-08-23",
  },
  schema: {
    type: "ProfessionalService",
    areaServed: ["AT", "DE", "CH"],
  },
  agent: {
    profile: "business-site",
    contentSignals: {
      search: true,
      aiInput: true,
      aiTrain: false,
    },
    markdown: {
      metadata: {
        enabled: true,
        defaultFields: [
          "title",
          "description",
          "url",
          "route",
          "locale",
          "section",
          "collection",
          "source",
          "updated",
        ],
      },
    },
    skills: {
      enabled: false,
      directory: "skills",
      legacyWellKnownAlias: false,
    },
  },
});
