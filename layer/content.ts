import {
  defineAgentAppPage,
  defineAgentMetadataFields,
  defineAgentSection,
  defineContentConfig,
} from "@lupinum/ginko-content/config";
import type { ContentAgentMarkdownOptions, ContentConfig } from "@lupinum/ginko-content/config";
import { createGinkoDocsCollections } from "./content-collections";

type GinkoDocsAgentPage = Parameters<typeof defineAgentAppPage>[0];
type GinkoDocsAgentSection = Parameters<typeof defineAgentSection>[0];

export interface GinkoDocsAgentOptions {
  /** Control whether authored documentation appears in compact and full indexes. */
  documentation?: ContentAgentMarkdownOptions;
  /** Add compact index pages that point agents to canonical raw Markdown. */
  pages?: readonly GinkoDocsAgentPage[];
  /** Add sections before the built-in blog and optional documentation sections. */
  sections?: readonly GinkoDocsAgentSection[];
}

export interface GinkoDocsContentOptions {
  site: {
    name: string | { en: string; de: string };
    description: string | { en: string; de: string };
    whenToUse: string | { en: string; de: string };
    whenNotToUse?: string | { en: string; de: string };
  };
  agent?: GinkoDocsAgentOptions;
  locales?: readonly ["en"] | readonly ["en", "de"];
  blog?: boolean;
}

type Collections = ReturnType<typeof createGinkoDocsCollections>;
type DocsCollection = Collections["docs"];
type BlogCollection = Collections["blog"];
type AuthorsCollection = Collections["authors"];
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
  const { docs, blog, authors } = createGinkoDocsCollections(i18n, options.agent?.documentation);
  const config = {
    agent: {
      site: {
        title: options.site.name,
        description: options.site.description,
        whenToUse: options.site.whenToUse,
        ...(options.site.whenNotToUse ? { whenNotToUse: options.site.whenNotToUse } : {}),
      },
      markdown: { metadata: { enabled: true, defaultFields: metadata } },
      sections: [
        ...(options.agent?.sections ?? []),
        ...(options.blog
          ? [defineAgentSection({ id: "blog", title: { en: "Blog", de: "Blog" }, order: 40 })]
          : []),
        defineAgentSection({
          id: "optional",
          title: { en: "Documentation", de: "Dokumentation" },
          order: 100,
        }),
      ],
      ...(options.agent?.pages ? { pages: [...options.agent.pages] } : {}),
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
