import {
  defineAgentMetadataFields,
  defineAgentSection,
  defineCollection,
  defineContentConfig,
  reference,
} from "@lupinum/ginko-content/config";
import { z } from "zod";
//#region layer/shared/route-slugs.ts
const routeSlugs = {
  home: {
    en: "/",
    de: "/",
  },
  docs: {
    en: "/docs",
    de: "/dokumentation",
  },
  blog: {
    en: "/blog",
    de: "/blog",
  },
};
//#endregion
//#region layer/content-collections.ts
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");
const nonEmptyString = z.string().trim().min(1);
const redirectFrom = z
  .array(nonEmptyString.regex(/^\//, "redirectFrom entries must be absolute site paths"))
  .optional();
const withSitemapLastmod = (data, lastmod) =>
  lastmod
    ? {
        ...data,
        sitemap: { lastmod: `${lastmod}T00:00:00.000Z` },
      }
    : data;
const docsSchemaWithLastmod = z
  .object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    updated: isoDate.optional(),
    redirectFrom,
    sidebar: z.enum(["section", "group"]).optional(),
    navigation: z
      .object({
        title: z.string().optional(),
        icon: z.string().optional(),
        badge: z.string().optional(),
        sidebar: z.enum(["section", "group"]).optional(),
      })
      .optional(),
  })
  .transform((data) => withSitemapLastmod(data, data.updated));
const blogSchemaWithLastmod = z
  .object({
    title: z.string(),
    description: z.string(),
    badge: z.string().optional(),
    date: isoDate,
    readingTime: nonEmptyString,
    author: reference("authors"),
    image: z.string().optional(),
    redirectFrom,
  })
  .transform((data) => withSitemapLastmod(data, data.date));
const authorsSchema = z.object({
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
});
function createGinkoDocsCollections(i18n) {
  return defineContentConfig({
    collections: {
      docs: defineCollection({
        type: "page",
        source: i18n ? "{1.docs,1.dokumentation}/**/*.md" : "docs/**/*.md",
        i18n: i18n ? true : void 0,
        route: i18n ? routeSlugs.docs : routeSlugs.docs.en,
        agent: {
          section: "optional",
          markdown: true,
        },
        strict: true,
        schema: docsSchemaWithLastmod,
      }),
      blog: defineCollection({
        type: "page",
        source: "2.blog/*.md",
        i18n: i18n ? true : void 0,
        route: i18n ? routeSlugs.blog : routeSlugs.blog.en,
        agent: {
          section: "blog",
          markdown: true,
        },
        strict: true,
        schema: blogSchemaWithLastmod,
      }),
      authors: defineCollection({
        type: "data",
        source: "authors/**/*.json",
        i18n: i18n ? true : void 0,
        strict: true,
        sitemap: false,
        schema: authorsSchema,
      }),
    },
  }).collections;
}
//#endregion
//#region layer/content.ts
function defineGinkoDocsConfig(options) {
  const locales = options.locales ?? ["en"];
  if (
    !(locales.length === 1
      ? locales[0] === "en"
      : locales.length === 2 && locales[0] === "en" && locales[1] === "de")
  )
    throw new TypeError('locales must be exactly ["en"] or ["en", "de"]');
  const i18n = locales.length === 2;
  const metadata = defineAgentMetadataFields([
    "title",
    "description",
    "url",
    "route",
    "locale",
    "section",
    "collection",
    "source",
    "updated",
  ]);
  const { docs, blog, authors } = createGinkoDocsCollections(i18n);
  const config = {
    agent: {
      site: {
        title: options.site.name,
        description: options.site.description,
        url: options.site.url,
      },
      markdown: {
        metadata: {
          enabled: true,
          defaultFields: metadata,
        },
      },
      sections: [
        ...(options.blog
          ? [
              defineAgentSection({
                id: "blog",
                title: {
                  en: "Blog",
                  de: "Blog",
                },
                order: 40,
              }),
            ]
          : []),
        defineAgentSection({
          id: "optional",
          title: {
            en: "Documentation",
            de: "Dokumentation",
          },
          order: 100,
        }),
      ],
    },
  };
  if (options.blog)
    return defineContentConfig({
      ...config,
      collections: {
        docs,
        blog,
        authors,
      },
    });
  return defineContentConfig({
    ...config,
    collections: { docs },
  });
}
//#endregion
export { defineGinkoDocsConfig };
