import {
  defineAgentAppPage,
  defineAgentMetadataFields,
  defineAgentSection,
  defineCollection,
  defineContentConfig,
} from "@lupinum/ginko-content/config";
import { z } from "zod";
import { formatSiteAddress, getLocalizedSiteText, resolveSiteUrl } from "./app/config/site.utils";
import { siteConfig } from "./app/site.config";
import { type LocaleCode, localizedPath } from "./i18n/locales";
import { localizedRoutes } from "./i18n/routes";

type LocalizedRouteKey = keyof (typeof localizedRoutes)[LocaleCode];

const navigationSchema = z.object({
  title: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  sidebar: z.enum(["section", "group"]).optional(),
});

const metadataFields = defineAgentMetadataFields(siteConfig.agent.markdown.metadata.defaultFields);

function localizedRoute(locale: LocaleCode, key: LocalizedRouteKey) {
  return localizedPath(locale, localizedRoutes[locale][key]);
}

function localizedRouteMap(key: LocalizedRouteKey) {
  return Object.fromEntries(
    siteConfig.site.locales.map((locale) => [locale, localizedRoute(locale, key)]),
  ) as Record<LocaleCode, string>;
}

function collectionRouteMap(key: LocalizedRouteKey) {
  return Object.fromEntries(
    siteConfig.site.locales.map((locale) => [locale, localizedRoutes[locale][key]]),
  ) as Record<LocaleCode, string>;
}

function contactMarkdown() {
  const address = formatSiteAddress(siteConfig).join(", ");
  return [
    `Email: <${siteConfig.contact.email}>`,
    siteConfig.contact.phone ? `Phone: ${siteConfig.contact.phone}` : undefined,
    `Address: ${address}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

export const docs = defineCollection({
  type: "page",
  source: "{1.docs,1.dokumentation}/**/*.md",
  i18n: true,
  route: collectionRouteMap("docs"),
  agent: {
    section: "optional",
    markdown: true,
  },
  strict: true,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    sidebar: z.enum(["section", "group"]).optional(),
    navigation: navigationSchema.optional(),
  }),
});

export const blog = defineCollection({
  type: "page",
  source: "2.blog/**/*.md",
  i18n: true,
  route: collectionRouteMap("blog"),
  agent: {
    section: "blog",
    markdown: true,
  },
  strict: true,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    badge: z.string().optional(),
    date: z.string(),
    readingTime: z.string(),
    author: z.string(),
  }),
});

export const authors = defineCollection({
  type: "data",
  source: "authors/**/*.json",
  i18n: true,
  strict: true,
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    avatar: z.string(),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
        }),
      )
      .optional(),
  }),
  sitemap: false,
});

export const legal = defineCollection({
  type: "page",
  source: "*.md",
  i18n: true,
  route: collectionRouteMap("home"),
  agent: {
    section: "legal",
    markdown: {
      metadata: [
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
  strict: true,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    legalType: z.enum(["privacy", "imprint", "terms"]),
    updated: z.string(),
  }),
});

export default defineContentConfig({
  agent: {
    site: {
      title: siteConfig.site.name,
      description: siteConfig.site.description,
      url: resolveSiteUrl(siteConfig.site.url),
      defaultLocale: siteConfig.site.defaultLocale,
      locales: siteConfig.site.locales,
      profile: siteConfig.agent.profile,
      contentSignals: siteConfig.agent.contentSignals,
    },
    markdown: {
      metadata: {
        enabled: siteConfig.agent.markdown.metadata.enabled,
        defaultFields: metadataFields,
      },
    },
    sections: [
      defineAgentSection({ id: "business", title: { de: "Business", en: "Business" }, order: 10 }),
      defineAgentSection({ id: "blog", title: "Blog", order: 40 }),
      defineAgentSection({ id: "legal", title: { de: "Rechtliches", en: "Legal" }, order: 90 }),
      defineAgentSection({ id: "content", title: { de: "Inhalte", en: "Content" }, order: 95 }),
      defineAgentSection({
        id: "optional",
        title: { de: "Dokumentation", en: "Documentation" },
        order: 100,
      }),
    ],
    pages: [
      defineAgentAppPage({
        id: "home",
        route: localizedRouteMap("home"),
        section: "business",
        title: ({ locale }) => getLocalizedSiteText(siteConfig.site.name, locale as LocaleCode),
        description: ({ locale }) =>
          getLocalizedSiteText(siteConfig.site.description, locale as LocaleCode),
        updated: siteConfig.legal.lastUpdated,
        metadata: metadataFields,
        render: ({ locale }) => {
          const typedLocale = locale as LocaleCode;
          const siteName = getLocalizedSiteText(siteConfig.site.name, typedLocale);
          const description = getLocalizedSiteText(siteConfig.site.description, typedLocale);
          return [
            `# ${siteName}`,
            "",
            `> ${description}`,
            "",
            `Business type: ${siteConfig.identity.type}`,
            `Area served: ${siteConfig.schema.areaServed.join(", ")}`,
            "",
            "## Contact",
            "",
            contactMarkdown(),
          ].join("\n");
        },
      }),
    ],
  },
  collections: {
    docs,
    blog,
    authors,
    legal,
  },
});
