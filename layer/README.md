# Ginko Docs

Ginko Docs is a Nuxt layer for focused documentation sites. It combines Ginko Content collections with a documentation shell, navigation, search, localization, SEO, social images, optional blog routes, and agent-readable Markdown surfaces.

## Requirements

- Node.js `^22.18.0 || ^24.11.0 || >=26.0.0`
- Nuxt `>=4.4.7 <5`
- Vue `^3.5.35`
- Vue Router `^5.1.0`
- Ginko Content `>=0.3.5 <0.4.0`

## Install

Install the layer and its Ginko Content peer:

```bash
pnpm add -D @lupinum/ginko-docs @lupinum/ginko-content@0.3.5
```

Keep the public identity in one shared value:

```json [site.json]
{
  "name": "Example Docs",
  "description": "Documentation for Example.",
  "url": "https://docs.example.com"
}
```

Extend the layer and configure the canonical origin:

```ts [nuxt.config.ts]
import site from "./site.json" with { type: "json" };

export default defineNuxtConfig({
  extends: ["@lupinum/ginko-docs"],
  site: { url: site.url },
  i18n: { baseUrl: site.url },
});
```

Define the content collections in `content.config.ts`:

```ts [content.config.ts]
import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";
import site from "./site.json" with { type: "json" };

export default defineGinkoDocsConfig({
  site,
  locales: ["en"],
  blog: false,
});
```

Single-locale documentation belongs in `content/docs`. Add a first page:

```md [content/docs/1.introduction.md]
---
title: Introduction
description: Learn what Example does and how to use it.
---

Example solves ...
```

The bare `/docs` route redirects to the first navigable document.

## Set the public identity

Presentation settings live in `app/app.config.ts`:

```ts [app/app.config.ts]
import site from "../site.json";

export default defineAppConfig({
  ginkoDocs: {
    site: {
      name: { en: site.name },
      description: { en: site.description },
      url: site.url,
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
      docsSidebarSwitcher: "tabs",
      lupinumAttribution: true,
    },
    nav: { links: "auto" },
    banner: { enabled: false, id: "default", showOnLanding: true },
    feedback: { enabled: false },
    toc: { depth: 3 },
  },
});
```

Localized values use `{ en, de? }`. Use English as the default locale; supported content layouts are English-only and bilingual English/German.

Set the production URL once in `site.json`, then pass it to the content configuration, app configuration, Nuxt Site configuration, and Nuxt i18n `baseUrl`. JSON keeps the shared identity portable across each configuration loader. The layer uses it for canonical links, structured data, social cards, and agent catalogs.

## Enable the blog

Set `blog: true` in `defineGinkoDocsConfig`. That single option creates the `blog` and `authors` collections and keeps the blog routes in the generated Nuxt application.

Blog posts are flat Markdown files under `content/2.blog` for an English-only site, or the corresponding locale directory for a bilingual site. Each post requires `title`, `description`, `date`, `readingTime`, and an `author` reference. Author records live under `authors` and require `slug`, `name`, `role`, `bio`, and `avatar`.

## Customize presentation

Use Nuxt's normal application directories. A consumer can replace `app/pages/index.vue`, layouts, or a stable shell component by providing the same component name:

- `SiteHeader`, `SiteFooter`, `SiteBanner`, `SiteLogoMark`
- `SiteLocaleSwitcher`, `SiteInteractionLayer`, `DocsSidebar`

Load consumer theme CSS from an app plugin so it follows the layer styles without replacing Nuxt's merged `css` array.

To add an authored MDC component, extend the exported tag map and declare its static render policy:

```ts [nuxt.config.ts]
import { ginkoDocsComponentTags } from "@lupinum/ginko-docs/components";

export default defineNuxtConfig({
  content: {
    componentPolicy: {
      components: {
        "api-playground": {
          kind: "block",
          props: {
            method: { type: "string", required: true },
            path: { type: "string", required: true },
          },
          slots: ["default"],
          media: null,
        },
      },
    },
    markdown: {
      tags: {
        ...ginkoDocsComponentTags,
        "api-playground": "MdcApiPlayground",
      },
    },
  },
});
```

Register the Vue component globally because Markdown resolves component targets dynamically. Register a serializer through `@lupinum/ginko-content/agent-registry` when copied and raw Markdown needs a representation other than the default XML-style component output.

## Agent and discovery surfaces

Every deployment can include the prerendered routes and assets:

- `/raw/**.md`
- `/llms.txt` and `/llms-full.txt`
- localized LLM catalogs
- sitemap, robots, and PNG social images

A Nitro server also provides request-time `Accept: text/markdown` negotiation, response link headers, and `/mcp`. The MCP server exposes read-only `list-pages` and `get-page` tools. Plain static hosting cannot provide those request-time behaviors.

The `markdownActions` app settings change the page menu only; they do not disable agent routes.

## Public exports

| Export                           | Contents                                                      |
| -------------------------------- | ------------------------------------------------------------- |
| `@lupinum/ginko-docs`            | Nuxt layer entry                                              |
| `@lupinum/ginko-docs/content`    | `defineGinkoDocsConfig`                                       |
| `@lupinum/ginko-docs/app-config` | App-configuration types                                       |
| `@lupinum/ginko-docs/components` | Tag map, component names, component policy, and related types |

## License

[MIT](./LICENSE)
