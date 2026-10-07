# Brief 05b: the section module

Goal: `modules: ['@lupinum/ginko-docs/section']` renders a docs section inside a host website: the host keeps `app.vue`, layout, header, footer, SEO, fonts, and color mode; the section adds its pages, the docs shell, the component set, one site-wide search, and the public composables.

Depends on: 05a. Release check: **yes**. Size: L. Commit after each numbered part and report after each commit.

Before hand-off: Claude re-reads this brief against `main` after 05a merges, confirms the component and composable locations, and splits it further if a part looks larger than 30 minutes.

## Read first

- `lupinum-website/changes-needed/ginko-docs-section-mode.md` (whole file; the "What section mode must not do" list and the acceptance criteria are binding)
- [contracts.md](../contracts.md) (all sections)
- `layer/nuxt.config.ts`, `layer/component-kit.ts` (a small module you can model on), `layer/modules/feature-routing.ts`
- `layer/app/layouts/docs.vue`, `layer/app/pages/docs/[...slug].vue`, `layer/app/pages/docs/index.vue`
- `layer/app/features/docs/**`, `layer/app/features/search/**`, `layer/app/composables/useDocsSearch.ts`, `useDocsNavigation.ts`
- Ginko Content: `useContentPage`, `useContentLocalePath`, `navigation`, `useContentSearch` (types in `node_modules/@lupinum/ginko-content/dist/runtime/app/composables/`). Search results carry `collection`, so grouping needs no Ginko Content change.

## Scope

Allowed: `layer/section/**` (new), `layer/package.json` (`exports`, `files`), `layer/app/assets/css/css-contract.test.ts`, moving shell components so both the layer and the section use one copy, `scripts/certify-*.mjs`, a new fixture under `scripts/fixtures/section-host/` (or the location the certification scripts already use for fixtures), docs pages for the module (English and German).

Forbidden: anything on the "What section mode must not do" list; changing the layer's behavior for existing consumers (brief 05c does the rebuild).

## Module options

```ts
export interface GinkoDocsSectionOptions {
  /** Collection from defineDocsSection. */
  collection: string;
  /** Host layout to render inside; false renders <DocsShell> with #header and #footer slots. */
  layout?: string | false; // default "default"
  /** Surface tokens for the section. */
  surface?: "framed" | "quiet"; // default "framed"
  /** Markdown component set. */
  components?: "docs" | "editorial"; // default "editorial"
  /** Show the sidebar; false renders the hub page, breadcrumb, related links, previous/next. */
  sidebar?: boolean; // default true
  /** Labels for search groups, keyed by collection name. Missing keys use the collection name. */
  searchGroups?: Record<string, string>;
  /** Host component rendered after every article, before previous/next (for a call to action). */
  articleEnd?: string;
  /** Host SEO hook name (auto-imported composable) called with { title, description, path, breadcrumbs }. Default: useSeoMeta with title and description. */
  seo?: string;
}
```

Config key: `ginkoDocsSection` in `nuxt.config.ts`. Validate at setup and throw a clear error for an unknown `components` value or a missing `collection`.

## Parts

### 1. Shell extraction

Move the docs shell into components that work without the layer's app: `DocsShell.vue` (the structure from brief 03b: `[data-docs-shell]`, sidebar slot, stage, article, TOC; `#header` and `#footer` slots), `DocsPage.vue` (today's `DocsPageContent.vue`, with the collection name from runtime config instead of the literal `"docs"`), and the sidebar, TOC, breadcrumb, pager, mobile bar, search dialog. The layer and the section import the same files. Replace every hard-coded `"docs"` collection name in these components (`useContentPage("docs")`, `navigation("docs", ...)`, `useDocsNavigationData`) with the configured collection (`useRuntimeConfig().public.ginkoDocsSection.collection`, default `"docs"` for the layer). `data-docs-shell` is `"section"` in the section.

Register shell components with the `Docs` prefix only; never register `components/ui/*` globally from the section (import them directly inside the shell components).

### 2. Module entry

`layer/section/module.ts`, exported as `@lupinum/ginko-docs/section` (package `exports`), with `defineDocsSection` re-exported from `@lupinum/ginko-docs/section/content` for convenience only if that does not pull Nuxt into the content config import (check; otherwise keep them separate and document both entries).

Setup:

- `extendPages`: add the section's catch-all page at each locale's mount (`route` from the collection; read it through Ginko Content's collection metadata or require it in the module options if not available; record which). The page sets `definePageMeta({ layout: false })`, loads the page with `useContentPage(collection)`, and renders `<NuxtLayout :name="layout" :content-page="contentPage"><DocsShell>…</DocsShell></NuxtLayout>` (the Ginko Content shared-header pattern). With `layout: false` it renders `<DocsShell>` directly.
- Components: register the set from `ginkoDocsComponentSets[components]` (brief 04e) and merge the matching entries of `ginkoDocsComponentPolicy` into `content.componentPolicy`, keeping host entries.
- CSS: push `docs-tokens.css`, `docs-shell.css`, `component-kit.css`, and (for `components: "docs"`) `prose.css` into `nuxt.options.css`. Scope rule: no rule in these files may target `html`, `body`, `:root` without `:where()`, or unprefixed element selectors outside `[data-docs-shell]`, `.content-prose`, or `.content-*`/`.docs-*` classes. Add that check to `css-contract.test.ts` (brief 02) for `docs-shell.css` and `component-kit.css`. `prose.css` gets the same check.
- `data-docs-surface`: set on the section root (`DocsShell`), not on `<html>`.
- Auto-import `useDocsSearch` and `useDocsNavigation` (`addImports`), and export their types.
- Peers: require `@nuxt/icon` and `@nuxt/image` when the chosen component set needs them; throw a clear setup error when missing. Install nothing.
- i18n: UI strings come from the layer's messages under a `ginkoDocs.*` namespace merged into the host's i18n when `@nuxtjs/i18n` is present; without it, use English defaults. Document how a host overrides a string.

### 3. Search across collections

- The search dialog uses `useContentSearch()` without a collection filter, then groups results by `result.collection` with labels from `searchGroups`. The section's collection comes first; other groups follow in `searchGroups` key order, then any remaining collections alphabetically.
- `useDocsSearch().open()` opens it from the host header. One dialog per site: the section mounts it once in `DocsShell` if no dialog exists yet (use a `useState` flag).

### 4. Optional sidebar and hub

With `sidebar: false`:

- No sidebar and no mobile drawer trigger.
- The section start page (the collection's index route) renders a hub: the page's own content, then its child pages as cards (`MdcCards`/`MdcCard` with title, description, and link), using the navigation tree.
- Each article shows the breadcrumb, then after the article: "Related" links (siblings in the same navigation folder, up to 5) and previous/next.
- Labels: `docs.related` (`Related` / `Verwandte Seiten`). Add to contracts section 8 in the pull request.

### 5. Article end and SEO

- `articleEnd`: resolve the component by name (`resolveComponent`) and render it after the article body, before previous/next, on every section page. It must appear in prerendered HTML.
- SEO: call the host hook named in `seo` with `{ title, description, path, breadcrumbs }`; default `useSeoMeta({ title, description })`. Emit `Article` and `BreadcrumbList` JSON-LD through `useHead` script entries only (not site-wide data; never `SoftwareApplication`). Add `FAQPage` when the page frontmatter has `faq: true` and the page has `accordion-item`s (question = item title, answer = item text); add `faq` to the docs schema in `defineDocsSection` (optional boolean).

### 6. Fixture and certification

A fixture host (Nuxt 4, Tailwind v4, a minimal shadcn setup with the brand variables, Ginko Content, `@nuxt/icon`, `@nuxt/image`, no ginko-docs layer) with:

- its own `app.vue`, `layouts/default.vue` with a header (search button calling `useDocsSearch().open()`) and a footer, a `pages` collection with one page, and a section `wissen` at `/wissen` (German only), `surface: "quiet"`, `components: "editorial"`, `articleEnd: "HostCta"`;
- a second config (or a second fixture) with `locales: ["de", "en", "it"]`, `route: { de: "/wissen", en: "/knowledge", it: "/sapere" }`, and `sidebar: false`.

Certify with the packed tarball, following `certify-packed-fixtures.mjs`: prerender with `failOnError`; the acceptance criteria 1 to 7 and 10 to 12 of the proposal; axe at 375 and 1440 px; a lint check that the fixture has no `#ginko-docs` import. Criterion 2 (module list) is a unit test in the module that compares `nuxt.options.modules` with and without the section module.

### 7. Docs

A page "Docs inside your website" / "Doku in deiner Website" under `5.customization` (both locales): when to use the section vs the layer, install, `defineDocsSection`, module options table, header integration with `useDocsSearch`, styling (tokens and hooks from contracts), the must-not list in one paragraph.

## Done when

- All fixture checks above pass in `pnpm release:verify`.
- The ginko-docs docs site is unchanged (brief 05c switches it).
- `pnpm verify` passes.

## Commits

1. `refactor(shell): extract DocsShell and DocsPage with a configurable collection`
2. `feat(section): add the section module`
3. `feat(search): one search across collections, grouped`
4. `feat(section): optional sidebar with a hub page`
5. `feat(section): host-owned article end and SEO`
6. `test(section): certify a host website fixture`
7. `docs(customization): docs inside your website`
