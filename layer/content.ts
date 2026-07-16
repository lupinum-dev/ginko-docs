import {
  defineAgentAppPage,
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
  site: { name: string; description: string; url: string };
  locales?: Array<"en" | "de">;
  defaultLocale?: "en" | "de";
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
  const defaultLocale = options.defaultLocale ?? locales[0] ?? "en";
  const i18n = locales.length > 1;
  const routeMap = (key: "docs" | "blog") =>
    Object.fromEntries(locales.map((locale) => [locale, routeSlugs[key][locale]]));
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
    route: i18n ? routeMap("docs") : routeSlugs.docs[defaultLocale],
    agent: { section: "optional", markdown: true },
    strict: true,
    schema: docsSchema,
  });
  const blog = defineCollection({
    type: "page",
    source: "2.blog/**/*.md",
    i18n: i18n ? true : undefined,
    route: i18n ? routeMap("blog") : routeSlugs.blog[defaultLocale],
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
        ...(options.blog ? [defineAgentSection({ id: "blog", title: "Blog", order: 40 })] : []),
        defineAgentSection({ id: "optional", title: "Documentation", order: 100 }),
      ],
      pages: [
        defineAgentAppPage({
          id: "home",
          route: Object.fromEntries(
            locales.map((locale) => [locale, locale === defaultLocale ? "/" : `/${locale}`]),
          ),
          section: "optional",
          title: options.site.name,
          description: options.site.description,
          metadata,
          render: () => `# ${options.site.name}\n\n> ${options.site.description}`,
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
