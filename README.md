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
