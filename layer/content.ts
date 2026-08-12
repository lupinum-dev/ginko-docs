import {
  defineAgentMetadataFields,
  defineAgentSection,
  defineContentConfig,
} from "@lupinum/ginko-content/config";
import type { ContentConfig } from "@lupinum/ginko-content/config";
import { createGinkoDocsCollections } from "./content-collections";

export interface GinkoDocsContentOptions {
  site: {
    name: string | { en: string; de: string };
    description: string | { en: string; de: string };
    url: string;
  };
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
  const { docs, blog, authors } = createGinkoDocsCollections(i18n);
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
