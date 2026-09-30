# Brief 05a: `defineDocsSection` with generic locales

Goal: a host site can add a docs collection to its own Ginko Content config without taking over the whole config, with any locale codes. `defineGinkoDocsConfig` becomes a thin wrapper around it, so there is one collection definition.

Depends on: 04e. Release check: **yes** (new package export).

Before hand-off: Claude re-reads this brief against `main` after 04e merges and updates file references if the code moved.

## Read first

- `lupinum-website/changes-needed/ginko-docs-section-mode.md`, sections "Content: `defineDocsSection`" and "Locales" (`/Users/matthias/Git/0_libs/lupinum-website/changes-needed/ginko-docs-section-mode.md`)
- `layer/content.ts`, `layer/content-collections.ts`, `layer/shared/route-slugs.ts`, `layer/i18n/locales.ts`
- `layer/package.json` (`exports`, `files`), `layer/content.js` is generated from `content.ts` (`pnpm build:content-entry`)
- The Ginko Content config types: `node_modules/@lupinum/ginko-content` `dist/config.d.mts` (`defineCollection`, `defineAgentSection`)

## Scope

Allowed: the files above; `layer/section/content.ts` (new) and its generated entry if the build needs one; `layer/package.json` (`exports`, `files`); tests next to the new file; `scripts/certify-packed-fixtures.mjs` or a new script under `scripts/` for the packed import check; `docs/content/en/1.docs/5.customization/1.site-configuration.md` and `docs/content/de/1.dokumentation/5.anpassung/1.website-konfigurieren.md`.

Forbidden: the Nuxt module (brief 05b); changing the layer's collection names, routes, or schema behavior.

## API

```ts
// layer/section/content.ts, exported as "@lupinum/ginko-docs/section/content"
export interface DocsSectionOptions {
  /** Collection name, also used by the section module (05b). Default "docs". */
  collection?: string;
  /** Glob relative to the content directory, e.g. "wissen/**\/*.md". */
  source: string;
  /** Mount path, or one path per locale: "/wissen" or { de: "/wissen", en: "/knowledge" }. */
  route: string | Record<string, string>;
  /** Locale codes; omit to follow the host's Nuxt i18n (single-locale when absent). */
  locales?: readonly string[];
  /** Agent-readable Markdown for this collection (Ginko Content option). Default true. */
  agent?: { section?: string; markdown?: ContentAgentCollectionConfig["markdown"] };
  /** Extra frontmatter fields merged into the docs schema. */
  extend?: z.ZodRawShape;
}

export function defineDocsSection(options: DocsSectionOptions): {
  collections: Record<string, DocsCollection>;
  agentSections: GinkoDocsAgentSection[];
};
```

Rules:

- The docs schema (title, description, icon, badge, updated, `redirectFrom`, sidebar, navigation, plus the sitemap `lastmod` transform) moves from `content-collections.ts` to one exported `docsSchema` used by both `defineDocsSection` and `defineGinkoDocsConfig`. One definition.
- `i18n` is `true` when more than one locale is given or `route` is a per-locale map; otherwise unset.
- `defineDocsSection` never returns a root config and never sets `agent.site`.
- `agentSections` contains one section with `id` = `options.agent?.section ?? options.collection ?? "docs"`, title from the collection name, `order: 100`.
- Validation: throw a `TypeError` with a clear message when `route` is a per-locale map and a locale in `locales` has no route, or when `source` is empty.

`defineGinkoDocsConfig` keeps its public signature and behavior (including its `["en"] | ["de"] | ["en","de"]` locales and fixed `docs`, `blog`, `authors` collections) and builds its `docs` collection by calling `defineDocsSection({ collection: "docs", source, route, locales, agent })` with the same values as today. Widening its locale rule is out of scope (brief 05c).

## Tests

`layer/section/content.test.ts`, one table test over inputs and expected collection fields (`type`, `source`, `route`, `i18n`) and one test per validation error. Wrong behaviors: a per-locale route is passed as a string (German pages mount at the English path); a missing locale route silently produces an unmounted locale; `defineGinkoDocsConfig` output changes. For the last one, compare `defineGinkoDocsConfig({...same options as docs/content.config.ts})` before and after with a snapshot of the collection options (not of Zod internals).

## Done when

- `import { defineDocsSection } from "@lupinum/ginko-docs/section/content"` works in a packed consumer: add a minimal check to `scripts/certify-packed-fixtures.mjs` that imports it in the fixture's `content.config.ts` path or a separate node script against the packed tarball, whichever the script structure supports; record which.
- The ginko-docs docs site builds with identical routes (compare the prerendered route list from `pnpm docs:build` before and after; it must be identical).
- Docs: a section "Add docs to an existing site" in `5.customization/1.site-configuration.md` and `5.anpassung/1.website-konfigurieren.md` with the example from the proposal, marked as "available from the next release".
- `pnpm verify` and `pnpm release:verify` pass.

## Commits

1. `refactor(content): one docs schema for all docs collections`
2. `feat(section): defineDocsSection for host content configs`
3. `docs(customization): document defineDocsSection`
