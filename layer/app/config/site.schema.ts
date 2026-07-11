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

const logoSchema = z
  .object({
    light: z.string().min(1),
    dark: z.string().min(1),
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
    social: z
      .object({
        github: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        instagram: z.string().url().optional(),
        youtube: z.string().url().optional(),
      })
      .strict(),
    blog: z.boolean().default(true),
    feedback: z
      .object({
        enabled: z.boolean().default(false),
        endpoint: z.string().url().optional(),
      })
      .strict()
      .default({ enabled: false }),
    agent: agentPolicySchema,
  })
  .strict()
  .superRefine((config, context) => {
    if (config.feedback.enabled && !config.feedback.endpoint) {
      context.addIssue({
        code: "custom",
        path: ["feedback", "endpoint"],
        message: "Enabled feedback requires an endpoint URL.",
      });
    }
  });

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export function validateSiteConfig(config: unknown): SiteConfig {
  return siteConfigSchema.parse(config);
}
