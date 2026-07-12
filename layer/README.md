# Ginko Docs

Ginko Docs is a publishable Nuxt layer for focused, searchable, multilingual documentation sites. It combines a polished application shell with Ginko Content collections, navigation, search, SEO, localized routes, and agent-readable Markdown surfaces.

The package currently lives in the Ginko Docs development repository. Repository links may move to the Lupinum organization without changing the package name or consumer API.

## Install

```sh
pnpm add -D @lupinum/ginko-docs
```

Extend the layer from `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  extends: ["@lupinum/ginko-docs"],
});
```

Define the site’s content collections in `content.config.ts`:

```ts
import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";

export default defineGinkoDocsConfig({
  site: {
    name: "Example Docs",
    description: "Documentation for Example.",
    url: "https://docs.example.com",
  },
  locales: ["en"],
  defaultLocale: "en",
  blog: false,
});
```

The content configuration is the source of truth for whether the optional blog exists. The layer removes blog routes when no blog collection is configured and derives navigation visibility from the resulting router.

Add public presentation settings in `app/app.config.ts`:

```ts
export default defineAppConfig({
  ginkoDocs: {
    site: {
      name: { en: "Example Docs" },
      description: { en: "Documentation for Example." },
      url: "https://docs.example.com",
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
    },
  },
});
```

## Public exports

- `@lupinum/ginko-docs` — Nuxt layer entry
- `@lupinum/ginko-docs/content` — typed content configuration factory
- `@lupinum/ginko-docs/app-config` — application-configuration types

## Agent surfaces

The layer can expose canonical content through raw Markdown negotiation, `/raw/**`, `/llms.txt`, `/llms-full.txt`, and read-only MCP tools. These surfaces use the same Ginko Content route and document model as rendered pages.

## Requirements

- Nuxt 4.4 or newer
- A package manager supported by Nuxt

## License

[MIT](./LICENSE)
