# Brief 05c: rebuild the layer on the section

Goal: `extends: ['@lupinum/ginko-docs']` is the section module plus a default site (header, footer, landing page, blog, site-wide SEO, social images, MCP). There is one docs shell code path.

Depends on: 05b. Release check: **yes**. Size: L. Commit per part, report after each.

Before hand-off: Claude re-reads this brief against `main` after 05b merges and lists the exact files to delete.

## Read first

- [plan.md](../plan.md) "Outcome" and decision 1
- `layer/nuxt.config.ts`, `layer/app/layouts/docs.vue`, `layer/app/pages/docs/**`, `layer/modules/feature-routing.ts`
- The section module from 05b (`layer/section/**`)

## Scope

Allowed: `layer/**`, `docs/**` (only if the docs site config must change), certification scripts.

Forbidden: changing public app config fields except those listed below; changing URLs of the docs site; removing the blog, landing page, MCP, or social images.

## Parts

### 1. The layer installs the section

- `layer/nuxt.config.ts` adds `@lupinum/ginko-docs/section` (by path inside the package) with: `collection: "docs"`, `layout: "docs-site"` (the renamed layer layout, see part 2), `surface` from `theme.surface`, `components: "docs"`, `sidebar: true`, `searchGroups` for `docs` and `blog` with the existing labels.
- The layer's own docs pages (`app/pages/docs/**`) are deleted; the section's page serves the docs routes. Keep `/docs` and `/dokumentation` (from `routeSlugs`) exactly.
- `theme.surface` from app config reaches the section: the section reads it at runtime when the layer is present (app config wins over the module option), so `data-docs-surface` keeps working per site.

### 2. The default site

- `layouts/docs.vue` becomes `layouts/docs-site.vue`: it renders `SiteSkipLink`, `SiteBanner`, `SiteHeader`, the slot, `SiteFooter`, `SiteInteractionLayer`. It no longer contains the sidebar or stage (the section's `DocsShell` does). The inset placement (`theme.shell`) stays a layer feature: the layout passes it to the shell as `data-docs-shell`.
- `app.vue` keeps site-wide SEO, `SoftwareApplication` JSON-LD, social images, analytics, canonical, and hreflang (these belong to the default site, not the section).
- The section's SEO hook in the layer is a layer composable that keeps today's per-page behavior (title with site name, OG image with the page title, `TechArticle` and `BreadcrumbList`). Compare the prerendered `<head>` of three docs pages before and after: identical except JSON-LD `@type` `TechArticle` may stay.

### 3. Remove the duplicates

Delete every shell component, composable, and CSS rule that the section now owns and the layer still has a copy of. `git grep` the old names from brief 05b part 1 and expect only the section's files.

### 4. Locales

`defineGinkoDocsConfig` accepts any locale list (drop the `["en"] | ["de"] | ["en","de"]` rule), because the section supports it. Keep `routeSlugs` for `en` and `de`; for other locales require a `routes` option (`{ docs: Record<locale, string> }`) and throw a clear error when it is missing. Update the reference docs (both locales).

## Done when

- The docs site's prerendered route list, sitemap, and `<head>` of three pages (English and German) are identical before and after (diff them in the pull request).
- Screenshots of the docs site at 375 and 1440, both schemes, standalone and inset, show no change.
- `pnpm verify` and `pnpm release:verify` pass, including all packed fixtures.

## Commits

1. `refactor(layer): serve docs pages through the section module`
2. `refactor(layer): default site layout around the section`
3. `refactor(layer): remove duplicated shell code`
4. `feat(content): any locale list in defineGinkoDocsConfig`
