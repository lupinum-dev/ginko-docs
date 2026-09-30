# Brief 01: public seams

Goal: a host can style the docs shell and build its own header without private imports or selectors into docs markup. No visual change.

Depends on: PR #70 merged. Release check: **yes** (`pnpm release:verify`), because certification selectors change.

## Why

rolfing (`/Users/matthias/Git/2_sites/rolfing`) imports two private files and patches the shell with `:has()` and label-text selectors (see [plan.md](../plan.md), breaking changes). This brief gives it public replacements. Brief 05d later removes rolfing's workarounds.

## Read first

- [contracts.md](../contracts.md) sections 4, 5, 7, 9
- `layer/app/layouts/docs.vue`
- `layer/app/features/docs/components/DocsSidebar.vue`, `DocsSidebarItem.vue`, `DocsToc.vue`, `DocsPageContent.vue`, `DocsMobileToc.vue`, `DocsBreadcrumb.vue`, `DocsPageNav.vue`
- `layer/app/features/docs/composables/useDocsNavigation.ts`, `useDocsNavigationData.ts`, `layer/app/features/docs/docs-navigation.ts`
- `layer/app/features/search/useCommandCenter.ts` (`useCommandCenterState`)
- `scripts/certify-packed-fixtures.mjs` (function `certifyBrowser` and the sidebar checks near lines 450 and 600)
- `docs/content/en/1.docs/5.customization/3.theming-and-overrides.md` and `docs/content/de/1.dokumentation/5.anpassung/3.design-und-overrides.md`
- `docs/content/en/1.docs/7.reference/2.app-config.md` and `docs/content/de/1.dokumentation/7.referenz/2.app-config.md`

## Scope

Allowed: the files above, `layer/app/assets/css/tailwind.css` (one comment line), `layer/app/composables/useDocsSearch.ts` (new), `layer/app/composables/useDocsNavigation.ts` (moved), every file that imports the old `useDocsNavigation` path, `.gitignore`, `CHANGELOG.md` is generated (do not edit).

Forbidden: visual changes (classes, CSS values), renaming i18n keys, changing `useCommandCenter` behavior.

## Changes

### 1. Hooks

Add the hooks from [contracts.md](../contracts.md) section 5:

| File | Change |
| --- | --- |
| `layouts/docs.vue` | Add `data-docs-shell="standalone"` to the root `<div>`. (Brief 03b makes the value configurable.) |
| `DocsSidebar.vue` | Replace `:data-variant="variant"` with `:data-docs-sidebar="variant"` on the `<aside>`. |
| `DocsPageContent.vue` | Add `data-docs-article` to `<main id="main-content">`. Add `data-docs-toc="desktop"` to the TOC `<aside>`. |
| `DocsMobileToc.vue` | Add `data-docs-toc="mobile"` to the root `<div>`. |
| `DocsBreadcrumb.vue` | Add `data-docs-breadcrumb` to the `<nav>`. |
| `DocsPageNav.vue` | Add `data-docs-pager` to the `<nav>`. |
| `DocsToc.vue` | Replace `data-toc-active` with `data-docs-active` (attribute and the `querySelectorAll("[data-toc-active]")` in `measureIndicator`). |
| `DocsPageContent.vue` | Update the `useRevealActive(tocAside, "[data-toc-active]", ...)` selector to `"[data-docs-active]"`. |

Leave `data-active` on sidebar links for now (brief 03a removes it).

Search the whole repository for `data-variant="desktop"`, `data-variant='desktop'`, `data-toc-active`, and `[data-variant` and update every remaining use (CSS in `layer/app/assets/css/`, tests, scripts).

### 2. Public composables

1. Move `layer/app/features/docs/composables/useDocsNavigation.ts` to `layer/app/composables/useDocsNavigation.ts` with `git mv`. Update every import of the old path.
2. Extend its return value to the shape in [contracts.md](../contracts.md) section 7:
   - `sections` (unchanged), `tree` (the existing `roots` computed), `breadcrumbs` (the existing `trail`), `current` (the last entry of `breadcrumbs` when its `path` equals the normalized route path, else `undefined`), `rootPath` (`useLocalizedPath()("docs")`).
   - Keep `trail` as an alias only if removing it would require changes outside the allowed files; otherwise rename callers to `breadcrumbs`.
3. Create `layer/app/composables/useDocsSearch.ts`:

```ts
import { readonly } from "vue";
import { useCommandCenterState } from "#ginko-docs/features/search/useCommandCenter";

/** Public entry to the one search dialog. Hosts call open() from their own header. */
export function useDocsSearch() {
  const { open, openCommandCenter, closeCommandCenter } = useCommandCenterState();
  return {
    isOpen: readonly(open),
    open: (query?: string) => openCommandCenter(query ?? ""),
    close: closeCommandCenter,
  };
}
```


### 3. Layout variables

In `layer/app/assets/css/tailwind.css`, keep the values. Add one comment line above the docs layout block: `/* Public layout variables: see docs "Theming and overrides". Hosts may override them. */`.

### 4. Documentation (English and German)

In `5.customization/3.theming-and-overrides.md` and `5.anpassung/3.design-und-overrides.md`, add a section:

- English heading: `Layout variables and styling hooks`. German: `Layout-Variablen und Styling-Hooks`.
- A table of the layout variables from [contracts.md](../contracts.md) section 4 (only those that exist after this brief: `--site-header-height`, `--site-banner-height`, `--docs-sidebar-width-expanded`, `--docs-sidebar-width`, `--docs-toc-width`, `--content-scroll-margin`) with default and meaning.
- A table of the hooks from section 5 that exist after this brief.
- One sentence: English `Class names, element nesting, and label text can change in any release. Use only these variables and attributes in your CSS.` German `Klassennamen, Verschachtelung und Beschriftungen können sich mit jedem Release ändern. Nutze in deinem CSS nur diese Variablen und Attribute.`
- A short example that overrides `--site-header-height` and styles `[data-docs-sidebar] [aria-current="page"]`.

In `7.reference/2.app-config.md` and `7.referenz/2.app-config.md`, add a section at the end, heading `Public composables` / `Öffentliche Composables`, with the signatures from contracts.md section 7 and this header example:

```vue
<script setup lang="ts">
const search = useDocsSearch();
const links = useAppConfig().ginkoDocs.nav.links;
</script>

<template>
  <button type="button" @click="search.open()">Search</button>
</template>
```

German example button text: `Suchen`.

### 5. Certification

In `scripts/certify-packed-fixtures.mjs`:

1. Replace every `aside[data-variant="desktop"]` with `aside[data-docs-sidebar="desktop"]`.
2. In `certifyBrowser`, after the first docs page is loaded, assert that these exist and throw a clear error naming the missing hook otherwise: `[data-docs-shell]`, `aside[data-docs-sidebar="desktop"]`, `[data-docs-article]`, `[data-docs-toc="desktop"]`, `[data-docs-pager]`, and one `aside[data-docs-sidebar="desktop"] a[aria-current="page"]`. Check `[data-docs-breadcrumb]` on a page that has a breadcrumb (a page at depth 2 or more) or skip it with a comment if the fixture has none.
3. Assert that `getComputedStyle(document.documentElement)` returns a non-empty value for `--site-header-height`, `--docs-sidebar-width`, and `--docs-toc-width`.

This is the regression test for the contract: it fails when a hook or a layout variable disappears from the packed package.

### 6. Evidence folder

Add `.evidence/` to `.gitignore`.

## Tests

No new unit tests. The certification assertions above are the test (they run against the packed package, which is the release boundary). Run `pnpm release:verify`.

## Done when

- `git grep -n "data-toc-active\|data-variant=\"desktop\"\|features/docs/composables/useDocsNavigation"` returns nothing.
- `pnpm verify` and `pnpm release:verify` pass.
- `shots.mjs` before and after screenshots are pixel-identical in layout (no visual change). State this in the pull request.
- Both locales of the theming page show the new section (screenshot of each at 1440 light).

## Commits

1. `feat(shell): add public data-docs styling hooks`
2. `feat(shell): expose useDocsSearch and useDocsNavigation`
3. `docs(customization): document layout variables, hooks, and public composables`
4. `chore: ignore local evidence folder`
