# Ginko Docs architecture

## Ownership

Ginko Content owns content identity, collections, localized content routes, navigation data, search data, sitemaps, and agent-readable representations. Ginko Docs owns the Nuxt application shell and presentation of those public surfaces. Consumers own site identity, copy, content, locale selection, and optional feature choices.

Every consumer feature has one authoring source. In particular, `defineGinkoDocsConfig({ blog })` controls whether the blog and author collections exist. The Docs feature-routing module observes Ginko Content’s resolved `content:context` and removes the layer’s blog pages when the collection is absent. Runtime navigation derives blog availability from the finalized localized router; it does not require a second application-configuration flag.

## Nuxt contracts

The package is a source Nuxt layer. Its `nuxt.config.ts` is intentionally the main export, following Nuxt’s layer distribution model. Build-time modules use Nuxt Kit and mutate the `pages:extend` array directly, as required by Nuxt’s pages API. Public, build-time presentation settings live in `app.config.ts`; content-domain facts do not.

The layer consumes Ginko Content’s public hooks and exports. It does not execute a consumer’s `content.config.ts`, inspect private Nuxt module state, or reproduce Ginko Content route algorithms.

## Generated content entry

`layer/content.ts` is the canonical typed source for the consumer content factory. `layer/content.js` is its derived JavaScript runtime entry because ordinary package consumers must not depend on a TypeScript loader. The workspace build regenerates it deterministically with Vite+'s Rolldown-backed library packer and the repository formatter. A release guard rebuilds it in a temporary location and requires byte-for-byte equality.

Both files are published deliberately: the package export maps TypeScript tooling to the source type entry and JavaScript runtimes to the generated entry. Do not edit `content.js` directly.

## Publication boundary

The `layer` directory is the npm package root. Its README, license, manifest, explicit file allowlist, and export map are part of the public contract. Release verification must inspect the package file list and execute public exports from an isolated packed installation rather than relying on workspace hoisting.

The current repository is a personal development location. Documentation avoids coupling the API to that location so the repository can transfer to the Lupinum organization without a consumer migration.

## Static icon delivery

Ginko Docs does not require a runtime icon endpoint or the public Iconify API. Nuxt Icon scans consumer-authored Vue, script, content, and navigation files, while `layer/icon-bundle.ts` lists icons owned by the installed layer because Nuxt Icon does not scan layer source outside the consumer root. A release guard verifies that every literal layer icon is present in that inventory. Dynamic consumer icon names must be written literally in a scanned consumer file or added through Nuxt Icon's `clientBundle.icons` option.

Vue and Vue Router are Vite singletons. The layer explicitly deduplicates both packages so linked workspace consumers cannot create distinct injection symbols when their dependency graph contains multiple peer-resolution contexts.
