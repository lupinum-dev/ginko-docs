# Ginko Docs

Ginko Docs is a publishable Nuxt layer for product and developer documentation. It adds the application shell, content routes, sidebar navigation, search, localization, SEO, social images, optional blog routes, and agent-readable output around content owned by the consuming application.

This repository contains two workspaces:

- `layer` is the publishable `@lupinum/ginko-docs` package.
- `playground` is the bilingual reference consumer and public documentation site.

## Start a documentation site

Use a Nuxt application on Node `^22.18.0 || ^24.11.0 || >=26.0.0`. The effective Nuxt range is `>=4.4.7 <5`. Install the layer and its Ginko Content peer:

```bash
pnpm add -D @lupinum/ginko-docs@0.3.0-rc.3 @lupinum/ginko-content@0.4.0-rc.1
```

Keep the public identity in one shared value:

```json [site.json]
{
  "name": "Example Docs",
  "description": "Documentation for Example.",
  "url": "https://docs.example.com"
}
```

Extend the layer and give Nuxt Site Config and Nuxt i18n the same origin:

```ts [nuxt.config.ts]
import site from "./site.json" with { type: "json" };

export default defineNuxtConfig({
  extends: ["@lupinum/ginko-docs"],
  site: { url: site.url },
  i18n: { baseUrl: site.url },
});
```

Define the documentation collection in `content.config.ts`:

```ts [content.config.ts]
import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";
import site from "./site.json" with { type: "json" };

export default defineGinkoDocsConfig({
  site,
  locales: ["en"],
  blog: false,
});
```

Set the public identity in `app/app.config.ts`:

```ts [app/app.config.ts]
import site from "../site.json";

export default defineAppConfig({
  ginkoDocs: {
    site: {
      name: { en: site.name },
      description: { en: site.description },
      url: site.url,
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
    },
  },
});
```

Add the first page at `content/docs/1.introduction.md`:

```md [content/docs/1.introduction.md]
---
title: Introduction
description: Learn what Example does and how to use it.
---

Example solves ...
```

Run the Nuxt development server and open `/docs`. The bare docs route redirects to the first navigable page.

The complete quickstart lives in [`playground/content/en/1.docs/1.getting-started/1.index.md`](./playground/content/en/1.docs/1.getting-started/1.index.md).

## What the layer supplies

- documentation and optional blog routes;
- collection-backed sidebar sections, groups, breadcrumbs, and previous/next links;
- an active-locale command center backed by MiniSearch;
- English and German route handling with translated content slugs;
- canonical URLs, hreflang links, structured data, sitemap, robots, and PNG social cards;
- accessible prose and 40+ policy-constrained MDC tags;
- raw Markdown, `llms.txt`, `llms-full.txt`, content negotiation, and read-only MCP tools;
- dark mode, image zoom, feedback, repository links, and a configurable landing page.

Ginko Content owns document identity, routes, search data, sitemap entries, and agent representations. Ginko Docs owns their Nuxt presentation. The consumer owns content, identity, locale records, optional integrations, and deployment.

## Configure presentation

Public build-time settings live under `ginkoDocs` in `app/app.config.ts`. Define only the values the site overrides.

```ts [app/app.config.ts]
import site from "../site.json";

export default defineAppConfig({
  ginkoDocs: {
    site: {
      name: { en: site.name, de: "Example-Dokumentation" },
      description: {
        en: site.description,
        de: "Dokumentation für Example.",
      },
      url: site.url,
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
      docsSidebarSwitcher: "tabs",
      lupinumAttribution: true,
    },
    nav: { links: "auto" },
    banner: { enabled: false, id: "release-2026-07", showOnLanding: true },
    feedback: { enabled: true },
    analytics: { plausible: { scriptId: "ExampleSiteScriptId" } },
    repository: {
      url: "https://github.com/example/docs",
      branch: "main",
      contentDirectory: "content",
    },
    toc: { depth: 3 },
  },
});
```

Localized values use the stable `{ en, de? }` shape. `docsSidebarSwitcher` changes only the section selector; the canonical content tree still owns sections and groups. See the [app configuration reference](./playground/content/en/1.docs/7.reference/2.app-config.md) for every field and default.

## Customize the layer

Use Nuxt's normal override rules. Consumers can replace pages and layouts or shadow these stable global shell components with a same-named component:

- `SiteHeader`
- `SiteFooter`
- `SiteBanner`
- `SiteLogoMark`
- `SiteLocaleSwitcher`
- `SiteInteractionLayer`
- `DocsSidebar`

Import consumer CSS from an app plugin so it loads after the layer styles. Add custom authored components by extending `ginkoDocsComponentTags`, declaring a narrow `content.componentPolicy`, and registering the Vue component globally. Register a Ginko Content agent serializer when the component needs a semantic Markdown representation.

The [custom component guide](./playground/content/en/1.docs/5.customization/4.custom-components.md) contains the complete example.

## Deployment surfaces

Static output includes prerendered pages, payloads, the MiniSearch index, raw Markdown routes, localized LLM catalogs, sitemap, robots, and PNG social cards. Browser-side features such as search, image zoom, the banner, analytics, and feedback UI continue to work.

A Nitro server adds request-time Markdown negotiation, response link headers, and `/mcp`. A plain static host cannot provide those request-time surfaces. The `markdownActions` settings hide menu entries; they do not disable the underlying agent routes.

## Public exports

| Export                           | Purpose                                                           |
| -------------------------------- | ----------------------------------------------------------------- |
| `@lupinum/ginko-docs`            | Nuxt layer entry                                                  |
| `@lupinum/ginko-docs/content`    | `defineGinkoDocsConfig`                                           |
| `@lupinum/ginko-docs/app-config` | Application-configuration types                                   |
| `@lupinum/ginko-docs/components` | MDC tag map, component names, component policy, and related types |

## Develop this repository

Vite+ owns package management and project commands here:

```bash
vp install
vp run dev
```

Run focused checks while editing, then the normal local gate:

```bash
vp run check
vp test
vp run build
```

Publishing is human-only. Follow [`MAINTAINING.md`](./MAINTAINING.md); never run a live publish command from an agent session.

Documentation contributions follow [`docs/WRITING.md`](./docs/WRITING.md).

## Support and license

Open a [GitHub issue](https://github.com/lupinum-dev/ginko-docs/issues) for a
reproducible defect. Discuss usage with the community in the
[Lupinum OSS Discord](https://discord.gg/RPH6SeA36N). Report vulnerabilities
through [SECURITY.md](./SECURITY.md).

Ginko Docs is developed by [Lupinum OG](https://lupinum.com) and released under
the [MIT License](./LICENSE).
