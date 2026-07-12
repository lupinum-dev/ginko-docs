# Ginko Docs

Ginko Docs is a publishable Nuxt layer for Markdown documentation sites. It provides the application shell, docs and optional blog routes, navigation, search, localization, SEO, agent routes, and a curated set of MDC and prose components.

The repository contains two workspaces:

- `layer` — the publishable `@lupinum/ginko-docs` package.
- `playground` — the bilingual reference site and development fixture.

## Develop

Vite+ owns package management and project commands in this repository.

```bash
vp install
vp run dev
```

Validate a change with:

```bash
vp run check
vp test
vp run build
```

## Consume the layer

Install the package, then extend it from the consuming Nuxt app:

```ts
export default defineNuxtConfig({
  extends: ["@lupinum/ginko-docs"],
});
```

Define collections, locales, sitemap metadata, and agent surfaces through the exported content
factory:

```ts
import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";

export default defineGinkoDocsConfig({
  site: {
    name: "Example Docs",
    description: "Documentation for Example.",
    url: "https://docs.example.com",
  },
  locales: ["en", "de"],
  defaultLocale: "en",
  blog: false,
});
```

The consumer owns its identity and landing-page copy in `app/app.config.ts`:

```ts
export default {
  ginkoDocs: {
    site: {
      url: "https://docs.example.com",
      name: { en: "Example Docs", de: "Example-Dokumentation" },
      description: {
        en: "Documentation for Example.",
        de: "Dokumentation für Example.",
      },
      logo: { light: "/logo.svg", dark: "/logo.svg" },
    },
  },
};
```

Localized app-config values always use the same `{ en, de? }` shape. Keeping one stable shape makes
Nuxt's layer merge and hot reload deterministic; a single-language site only needs the `en` value.

Content belongs to the consumer. A single-locale docs tree can start at `content/docs`; localized sites can use locale-prefixed trees configured through the collection factory.

## Customize the presentation

Use Nuxt's normal application directories. A consumer can replace `app/pages/index.vue`, its
layouts, or any of these stable shell components by creating a component with the same name:

- `SiteHeader`, `SiteFooter`, `SiteBanner`, `SiteLogoMark`
- `SiteLocaleSwitcher`, `SiteInteractionLayer`, `DocsSidebar`

Import consumer theme CSS from an app plugin so it is added after the layer styles without replacing
Nuxt's merged `css` array. MDC components work the same way: place a replacement or a new component
in `app/components/mdc`, then extend the layer's tag map instead of copying it:

```ts
import { ginkoDocsComponentTags } from "@lupinum/ginko-docs/components";

export default defineNuxtConfig({
  content: {
    markdown: {
      tags: {
        ...ginkoDocsComponentTags,
        "api-playground": "MdcApiPlayground",
      },
    },
  },
});
```

MDC renders tag targets dynamically, so register custom MDC components globally in a small Nuxt
plugin (or use Nuxt's `.global.vue` filename suffix). No Docs-specific visual registry is needed:

```ts
import { defineNuxtPlugin } from "#app";
import MdcApiPlayground from "../components/mdc/MdcApiPlayground.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("MdcApiPlayground", MdcApiPlayground);
});
```

If a custom MDC component needs special copied or raw Markdown, register its serializer explicitly
with Ginko Content's `agent-registry` server API. Visual discovery remains Nuxt-native; agent output
remains explicit and testable.

## Public agent surfaces

The layer exposes the same canonical content through:

- `/llms.txt` and `/llms-full.txt`
- `/raw/**` Markdown routes
- `/mcp`, with `list-pages` and `get-page` read-only tools

The MCP tools read the canonical agent routes rather than maintaining a second content index.

## Package exports

- `@lupinum/ginko-docs` — Nuxt layer entry
- `@lupinum/ginko-docs/content` — collection factory
- `@lupinum/ginko-docs/app-config` — app-config types and defaults
- `@lupinum/ginko-docs/components` — default MDC tag map and related types
