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
      localeSwitcher: "dropdown",
      docsSidebarSwitcher: "tabs",
      lupinumAttribution: true,
    },
  },
};
```

Localized app-config values always use the same `{ en, de? }` shape. Keeping one stable shape makes
Nuxt's layer merge and hot reload deterministic; a single-language site only needs the `en` value.
`docsSidebarSwitcher` accepts `tabs`, `dropdown`, or `list`. It changes only the section selector;
sections and groups continue to come from the canonical content tree.
The footer credits Lupinum by default. Third-party consumers can set `lupinumAttribution: false`
without replacing the footer component.

Content belongs to the consumer. A single-locale docs tree can start at `content/docs`; localized sites can use locale-prefixed trees configured through the collection factory.

### Configuration reference

Every feature ships with a safe default; consumers override only what they need under `ginkoDocs`:

```ts
export default {
  ginkoDocs: {
    // Header + mobile menu navigation. "auto" derives Docs (and Blog when a
    // blog collection exists); pass an array of localized links to override.
    nav: { links: "auto" },
    // nav: { links: [{ label: { en: "Guides" }, to: { en: "/docs" } }] },

    // Announcement banner. "auto" shows it when a blog exists (links to the
    // blog); set explicit text/link for release announcements. Dismissal is
    // persisted per `id` — bump the id to re-show after an update.
    banner: {
      enabled: "auto",
      id: "default",
      showOnLanding: true,
      // text: { en: "v2 is out!" },
      // link: { label: { en: "Changelog" }, to: { en: "/blog/v2" } },
    },

    // Plausible analytics (loaded via Nuxt Scripts). Fully disabled until a
    // domain is set — nothing is injected without it.
    // analytics: { plausible: { domain: "docs.example.com" } },
    // Self-hosted: { domain, scriptSrc: "https://plausible.acme.dev/js/script.js" }
    // Extensions default to ["outbound-links"].

    // "Was this page helpful?" widget (thumbs up/down). Votes are sent as the
    // Plausible event `docs-feedback` with { path, helpful, locale } props;
    // a "no" vote offers a prefilled GitHub issue when `repository` is set.
    feedback: { enabled: false },

    // Social cards are generated as PNGs at build time (nuxt-og-image, satori).
    // Override the template by shadowing app/components/OgImage/GinkoDocs.satori.vue
    // or point `component` at your own OgImage template.
    ogImage: { enabled: true, component: "GinkoDocs" },

    // AI/agent entries in the "Copy Markdown" split menu.
    markdownActions: { chatGpt: true, claude: true, mcp: true },

    // Click-to-zoom lightbox for prose images (rendered via <NuxtImg>).
    images: { zoom: true },

    // "On this page" depth: 2 (h2 only) to 4 (h2–h4).
    toc: { depth: 3 },

    // Optional landing hero visual (right column on large screens).
    landing: {
      hero: {
        media: { type: "code", filename: "app.config.ts", code: "export default { /* … */ }" },
        // or: media: { type: "image", src: "/hero.png", alt: "Product screenshot" },
      },
    },
  },
};
```

Notes:

- The bare docs root (`/docs`, `/de/dokumentation`) redirects to the first documentation page.
- No static `/public/og-image.svg` is needed anymore; social images are prerendered per page.
- The 404 page renders with the full site chrome and localized actions.

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

The policy is the public render-safety boundary for authored Markdown. Nuxt merges the consumer's
component entry with the policies supplied by Ginko Docs, so consumers define only their own tags.
Dynamic Vue bindings remain rejected in public Markdown; declare the narrowest static prop and slot
contract the component needs.

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
