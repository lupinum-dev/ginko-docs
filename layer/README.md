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
export default {
  ginkoDocs: {
    site: {
      name: { en: "Example Docs" },
      description: { en: "Documentation for Example." },
      url: "https://docs.example.com",
      logo: { light: "/logo.svg", dark: "/logo-dark.svg" },
    },
  },
};
```

## Public exports

- `@lupinum/ginko-docs` — Nuxt layer entry
- `@lupinum/ginko-docs/content` — typed content configuration factory
- `@lupinum/ginko-docs/app-config` — application-configuration types
- `@lupinum/ginko-docs/components` — default MDC tag map and related types

## Customize

Consumers use Nuxt's ordinary override rules. Add `app/pages/index.vue` or a layout to replace a
page or layout. Add a same-named `SiteHeader`, `SiteFooter`, `SiteBanner`, `SiteLogoMark`,
`SiteLocaleSwitcher`, `SiteInteractionLayer`, or `DocsSidebar` component to replace that shell
piece. Import consumer theme CSS from an app plugin so it augments rather than replaces the layer's
styles. Add or replace MDC components in `app/components/mdc` and extend
`ginkoDocsComponentTags` from `@lupinum/ginko-docs/components` in `content.markdown.tags`. Register
custom MDC components globally with a Nuxt plugin or Nuxt's `.global.vue` filename suffix, because
MDC resolves tag targets dynamically. Each new tag must also declare its narrow static prop and slot
contract in `content.componentPolicy`; Nuxt merges that consumer entry with the layer's built-in
policy.

Custom agent Markdown is deliberately separate: register serializers through
`@lupinum/ginko-content/agent-registry` in a Nitro plugin.

## Agent surfaces

The layer can expose canonical content through raw Markdown negotiation, `/raw/**`, `/llms.txt`, `/llms-full.txt`, and read-only MCP tools. These surfaces use the same Ginko Content route and document model as rendered pages.

## Requirements

- Nuxt 4.4 or newer
- A package manager supported by Nuxt

## License

[MIT](./LICENSE)
