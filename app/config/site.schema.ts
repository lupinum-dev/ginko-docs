import { agentMetadataFields } from "@lupinum/ginko-content/config";
import { z } from "zod";
import { defaultLocale, localeCodes } from "../../i18n/locales";

const localeSchema = z.enum(localeCodes);
export type LocaleCode = z.infer<typeof localeSchema>;
export type LocalizedText =
  | string
  | ({ [K in typeof defaultLocale]: string } & Partial<
      Record<Exclude<LocaleCode, typeof defaultLocale>, string>
    >);

const localizedTextShape = Object.fromEntries(
  localeCodes.map((locale) => [
    locale,
    locale === defaultLocale ? z.string().min(1) : z.string().min(1).optional(),
  ]),
) as unknown as Record<LocaleCode, z.ZodString | z.ZodOptional<z.ZodString>>;
const localizedTextSchema = z.union([
  z.string().min(1),
  z.object(localizedTextShape).strict(),
]) as z.ZodType<LocalizedText>;

const serviceCategorySchema = z.enum(["essential", "analytics", "marketing", "support", "embeds"]);

const logoSchema = z
  .object({
    light: z.string().min(1),
    dark: z.string().min(1),
  })
  .strict();

const addressSchema = z
  .object({
    street: z.string().min(1),
    postalCode: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    countryCode: z.string().length(2),
  })
  .strict();

const analyticsProviderSchema = z
  .object({
    enabled: z.boolean(),
    consentCategory: serviceCategorySchema.default("analytics"),
    consentMode: z.boolean().default(false),
    domain: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
  })
  .strict();

const optionalProviderSchema = z
  .object({
    enabled: z.boolean(),
    consentCategory: serviceCategorySchema,
    id: z.string().min(1).optional(),
  })
  .strict();

const formEndpointSchema = z
  .object({
    provider: z.enum(["basin"]),
    productionEndpoint: z.string().url().optional(),
  })
  .strict();

const agentPolicySchema = z
  .object({
    profile: z.enum(["business-site", "starter-docs"]),
    contentSignals: z
      .object({
        search: z.boolean(),
        aiInput: z.boolean(),
        aiTrain: z.boolean(),
      })
      .strict(),
    markdown: z
      .object({
        metadata: z
          .object({
            enabled: z.boolean(),
            defaultFields: z.array(z.enum(agentMetadataFields)),
          })
          .strict(),
      })
      .strict(),
    skills: z
      .object({
        enabled: z.boolean(),
        directory: z.string().min(1),
        legacyWellKnownAlias: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const siteConfigSchema = z
  .object({
    site: z
      .object({
        name: localizedTextSchema,
        description: localizedTextSchema,
        url: z.string().url(),
        defaultLocale: localeSchema,
        locales: z.array(localeSchema).min(1),
        localeSwitcher: z.enum(["dropdown", "segmented"]).default("dropdown"),
        docsSidebarSwitcher: z.enum(["dropdown", "list", "tabs"]).default("tabs"),
        logo: logoSchema,
      })
      .strict(),
    identity: z
      .object({
        legalName: z.string().min(1),
        brandName: z.string().min(1),
        type: z.enum(["Organization", "LocalBusiness", "ProfessionalService"]),
        countryProfile: z.enum(["AT", "DE", "CH"]),
        vatId: z.string().min(1).optional(),
        registry: z.string().min(1).optional(),
        registryCourt: z.string().min(1).optional(),
        managingDirectors: z.array(z.string().min(1)).default([]),
        foundingYear: z.number().int().min(1800).max(2100).optional(),
      })
      .strict(),
    contact: z
      .object({
        email: z.string().email(),
        privacyEmail: z.string().email(),
        legalEmail: z.string().email(),
        phone: z.string().min(1).optional(),
        address: addressSchema,
      })
      .strict(),
    social: z
      .object({
        github: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        instagram: z.string().url().optional(),
        youtube: z.string().url().optional(),
      })
      .strict(),
    analytics: z
      .object({
        plausible: analyticsProviderSchema,
        ga4: analyticsProviderSchema,
        gtm: analyticsProviderSchema,
      })
      .strict(),
    marketing: z
      .object({
        metaPixel: optionalProviderSchema,
        linkedinInsight: optionalProviderSchema,
      })
      .strict(),
    embeds: z
      .object({
        youtube: optionalProviderSchema,
        vimeo: optionalProviderSchema,
        googleMaps: optionalProviderSchema,
        calCom: optionalProviderSchema,
        calendly: optionalProviderSchema,
      })
      .strict(),
    forms: z
      .object({
        provider: z.enum(["basin"]),
        testEndpoint: z.string().url().optional(),
        endpoints: z.record(z.string(), formEndpointSchema),
      })
      .strict(),
    chat: z
      .object({
        enabled: z.boolean(),
        provider: z.enum(["none", "brevo", "crisp", "hubspot", "custom"]),
        consentCategory: serviceCategorySchema,
        availability: localizedTextSchema,
        fallbackLabel: localizedTextSchema,
        fallbackMethod: z.enum(["contact-page", "email"]),
        fallbackEmail: z.string().email(),
        providerId: z.string().min(1).optional(),
      })
      .strict(),
    legal: z
      .object({
        jurisdiction: localizedTextSchema,
        lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        responsibleForContent: z.string().min(1).optional(),
      })
      .strict(),
    schema: z
      .object({
        type: z.enum(["Organization", "LocalBusiness", "ProfessionalService"]),
        areaServed: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    agent: agentPolicySchema,
  })
  .strict()
  .superRefine((config, context) => {
    if (config.analytics.plausible.enabled && !config.analytics.plausible.domain) {
      context.addIssue({
        code: "custom",
        path: ["analytics", "plausible", "domain"],
        message: "Enabled Plausible analytics requires a domain.",
      });
    }

    for (const provider of ["ga4", "gtm"] as const) {
      if (config.analytics[provider].enabled && !config.analytics[provider].id) {
        context.addIssue({
          code: "custom",
          path: ["analytics", provider, "id"],
          message: `Enabled ${provider.toUpperCase()} analytics requires an id.`,
        });
      }
    }

    for (const provider of ["metaPixel", "linkedinInsight"] as const) {
      if (config.marketing[provider].enabled && !config.marketing[provider].id) {
        context.addIssue({
          code: "custom",
          path: ["marketing", provider, "id"],
          message: `Enabled ${provider} marketing requires an id.`,
        });
      }
    }

    if (config.chat.enabled && config.chat.provider === "none") {
      context.addIssue({
        code: "custom",
        path: ["chat", "provider"],
        message: "Enabled chat requires a real provider.",
      });
    }

    if (config.chat.enabled && config.chat.provider !== "none" && !config.chat.providerId) {
      context.addIssue({
        code: "custom",
        path: ["chat", "providerId"],
        message: "Enabled chat requires a provider id.",
      });
    }
  });

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export function validateSiteConfig(config: unknown): SiteConfig {
  return siteConfigSchema.parse(config);
}
