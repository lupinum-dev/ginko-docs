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
  updated: z.string().optional(),
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
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  badge: z.string().optional(),
  date: z.string(),
  readingTime: z.string(),
  author: reference("authors"),
  image: z.string().optional(),
});
const authorsSchema = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  avatar: z.string(),
  links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
});

type DocsCollection = ContentCollectionConfig<typeof docsSchema>;
type BlogCollection = ContentCollectionConfig<typeof blogSchema>;
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
    schema: docsSchema,
  });
  const blog = defineCollection({
    type: "page",
    source: "2.blog/*.md",
    i18n: i18n ? true : undefined,
    route: i18n ? routeSlugs.blog : routeSlugs.blog.en,
    agent: { section: "blog", markdown: true },
    strict: true,
    schema: blogSchema,
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
