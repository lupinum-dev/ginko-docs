import {
  defineAgentMetadataFields,
  defineAgentSection,
  defineCollection,
  defineContentConfig,
  reference,
} from "@lupinum/ginko-content/config";
import type { ContentCollectionConfig, ContentConfig } from "@lupinum/ginko-content/config";
import { z } from "zod";
import { routeSlugs } from "./shared/route-slugs";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");
const nonEmptyString = z.string().trim().min(1);
/** Former public URLs of a page, as served: locale prefix and translated slugs included. */
const redirectFrom = z
  .array(nonEmptyString.regex(/^\//, "redirectFrom entries must be absolute site paths"))
  .optional();

/**
 * Derives the sitemap lastmod from the authored date so it has one source of
 * truth. Route records require normalized UTC ISO values.
 */
const withSitemapLastmod = <T extends object>(data: T, lastmod: string | undefined) =>
  lastmod ? { ...data, sitemap: { lastmod: `${lastmod}T00:00:00.000Z` } } : data;

export interface GinkoDocsContentOptions {
  site: {
    name: string | { en: string; de: string };
    description: string | { en: string; de: string };
    url: string;
  };
  locales?: readonly ["en"] | readonly ["en", "de"];
  blog?: boolean;
}

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

type DocsCollection = ContentCollectionConfig<typeof docsSchemaWithLastmod>;
type BlogCollection = ContentCollectionConfig<typeof blogSchemaWithLastmod>;
type AuthorsCollection = ContentCollectionConfig<typeof authorsSchema>;
type DocsContentConfig = ContentConfig<{ docs: DocsCollection }>;
type DocsBlogContentConfig = ContentConfig<{
  docs: DocsCollection;
  blog: BlogCollection;
  authors: AuthorsCollection;
}>;

export function defineGinkoDocsConfig(
  options: GinkoDocsContentOptions & { blog: true },
): DocsBlogContentConfig;
export function defineGinkoDocsConfig(options: GinkoDocsContentOptions): DocsContentConfig;
export function defineGinkoDocsConfig(
  options: GinkoDocsContentOptions,
): DocsContentConfig | DocsBlogContentConfig {
  const locales = options.locales ?? ["en"];
  const validLocales =
    locales.length === 1
      ? locales[0] === "en"
      : locales.length === 2 && locales[0] === "en" && locales[1] === "de";
  if (!validLocales) {
    throw new TypeError('locales must be exactly ["en"] or ["en", "de"]');
  }
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
  const docs = defineCollection({
    type: "page",
    source: i18n ? "{1.docs,1.dokumentation}/**/*.md" : "docs/**/*.md",
    i18n: i18n ? true : undefined,
    route: i18n ? routeSlugs.docs : routeSlugs.docs.en,
    agent: { section: "optional", markdown: true },
    strict: true,
    schema: docsSchemaWithLastmod,
  });
  const blog = defineCollection({
    type: "page",
    source: "2.blog/*.md",
    i18n: i18n ? true : undefined,
    route: i18n ? routeSlugs.blog : routeSlugs.blog.en,
    agent: { section: "blog", markdown: true },
    strict: true,
    schema: blogSchemaWithLastmod,
  });
  const authors = defineCollection({
    type: "data",
    source: "authors/**/*.json",
    i18n: i18n ? true : undefined,
    strict: true,
    sitemap: false,
    schema: authorsSchema,
  });
  const config = {
    agent: {
      site: {
        title: options.site.name,
        description: options.site.description,
        url: options.site.url,
      },
      markdown: { metadata: { enabled: true, defaultFields: metadata } },
      sections: [
        ...(options.blog
          ? [defineAgentSection({ id: "blog", title: { en: "Blog", de: "Blog" }, order: 40 })]
          : []),
        defineAgentSection({
          id: "optional",
          title: { en: "Documentation", de: "Dokumentation" },
          order: 100,
        }),
      ],
    },
  };

  if (options.blog) {
    return defineContentConfig({
      ...config,
      collections: { docs, blog, authors },
    }) as DocsBlogContentConfig;
  }
  return defineContentConfig({ ...config, collections: { docs } }) as DocsContentConfig;
}
