import { defineCollection, defineContentConfig, reference } from "@lupinum/ginko-content/config";
import type { ContentAgentCollectionConfig } from "@lupinum/ginko-content/config";
import { z } from "zod";
import { routeSlugs } from "./shared/route-slugs";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");
const nonEmptyString = z.string().trim().min(1);
const redirectFrom = z
  .array(nonEmptyString.regex(/^\//, "redirectFrom entries must be absolute site paths"))
  .optional();

const withSitemapLastmod = <T extends object>(data: T, lastmod: string | undefined) =>
  lastmod ? { ...data, sitemap: { lastmod: `${lastmod}T00:00:00.000Z` } } : data;

const docsSchema = z.object({
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
});
const docsSchemaWithLastmod = docsSchema.transform((data) =>
  withSitemapLastmod(data, data.updated),
);
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  badge: z.string().optional(),
  date: isoDate,
  readingTime: nonEmptyString,
  author: reference("authors"),
  image: z.string().optional(),
  redirectFrom,
});
const blogSchemaWithLastmod = blogSchema.transform((data) => withSitemapLastmod(data, data.date));
const authorsSchema = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  avatar: z.string(),
  links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
});

export function createGinkoDocsCollections(
  i18n: boolean,
  docsMarkdown: ContentAgentCollectionConfig["markdown"] = true,
) {
  return defineContentConfig({
    collections: {
      docs: defineCollection({
        type: "page",
        source: i18n ? "{1.docs,1.dokumentation}/**/*.md" : "docs/**/*.md",
        i18n: i18n ? true : undefined,
        route: i18n ? routeSlugs.docs : routeSlugs.docs.en,
        agent: { section: "optional", markdown: docsMarkdown },
        strict: true,
        schema: docsSchemaWithLastmod,
      }),
      blog: defineCollection({
        type: "page",
        source: "2.blog/*.md",
        i18n: i18n ? true : undefined,
        route: i18n ? routeSlugs.blog : routeSlugs.blog.en,
        agent: { section: "blog", markdown: true },
        strict: true,
        schema: blogSchemaWithLastmod,
      }),
      authors: defineCollection({
        type: "data",
        source: "authors/**/*.json",
        i18n: i18n ? true : undefined,
        strict: true,
        sitemap: false,
        schema: authorsSchema,
      }),
    },
  }).collections;
}
