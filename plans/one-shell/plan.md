# One docs shell: redesign, token contract, section mode

Status: agreed direction, 2026-09-30. Prototype: [reference/prototype.html](reference/prototype.html) (published privately at https://claude.ai/artifact/UuSFM2dBrzvWiF3BUHXbsE).
Base: `main` after PR #70 (editorial layouts and component authoring) and PR #71 (dependency advisories).
Website side: `lupinum-website/changes-needed/ginko-docs-section-mode.md` (section mode API, rolfing migration).

## Outcome

Ginko Docs is one docs shell with two ways to install it:

| Install | Who | What the host keeps |
| --- | --- | --- |
| `@lupinum/ginko-docs/section` (module) | Business websites with a wiki, handbook, or help area (`/wissen`, `/hilfe`) | Its own `app.vue`, layout, header, footer, SEO, fonts, color mode |
| `extends: ['@lupinum/ginko-docs']` (layer) | Our libraries' docs sites | Nothing to build: the layer adds the site around the section |

The layer is rebuilt on top of section mode, so there is one shell code path. A lib docs site goes live with `site.json`, content, and a short `app.config` (name, logo, repository, preset) and no CSS. A website section takes the site's brand without extra configuration.

## Decisions

| # | Decision |
| --- | --- |
| 1 | The layer is section mode plus a default site. One shell, no second copy. |
| 2 | Website presets (`surface: "quiet"`, render inside the host layout) are opt-in. Defaults stay: framed, standalone. |
| 3 | Two Markdown component sets, chosen per section: `docs` (all) and `editorial`. The editorial set grows from the existing `@lupinum/ginko-docs/component-kit` module (see "Component sets"). |
| 4 | The sidebar is optional per section. Small wikis can use a hub page, breadcrumb, and related links instead. |
| 5 | Lupinum writes most website wiki content for now. Full MDC support is required; no visual editor work in this plan. |
| 6 | Callouts use variant A: a rounded line and a colored title row; framed adds a light tint, quiet is the line alone. |
| 7 | Remove the inline `toc` component and the five layout border types (`card`, `border`, `border-dashed`, `outline`, `outline-dashed`). |
| 8 | Derived docs tokens use the `--docs-` prefix so they never collide with a host's variables. The sidebar uses the standard shadcn `--sidebar-*` names. |
| 9 | The current sidebar link is marked only with `aria-current="page"`; the active TOC entries only with `data-docs-active`. These attributes are the styling hooks. `data-active` and `data-toc-active` go away. |
| 10 | The TOC and the sidebar respond to the space they have (container queries on the shell), not to the viewport, so the shell works inside a host layout of any width. |

## Design rules (from the prototype)

1. **Text blocks use a rounded line:** callout, aside, excerpt, blockquote.
2. **Objects use a frame:** frame (radius 14, padding 4) holds a head row, a panel (radius 10) with the content, and a foot row. Code, code group, code tree, collapse, tables, cards, read more, tabs, accordion, steps markers, timeline, files, API panel, figure, quiz.
3. **Layout has no chrome:** layout, column, flow, center. The only decoration is `surface="muted" | "tint"`, from the same tokens as frames.
4. **Sidebar:** shadcn sub-menu pattern. One 32 px row for every level, one text size, children inside a neutral line, one filled chip for the current page, icons on top-level rows only. Section tabs never truncate.
5. **One selected state per kind:** active tabs, section tabs, and the selected code tree file use the same chip; the current page in the sidebar uses the sidebar accent fill (shadcn pattern, as in the prototype).
6. **API panel:** name first, muted type, neutral "Required" mark, one meta line for default and version, struck-through name when deprecated.

## Theming

Three layers. A host changes only the first. Full CSS in [contracts.md](contracts.md).

1. **Brand (host):** shadcn variables `--background`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--primary`, `--primary-foreground`, `--accent`, `--border`, `--ring`, `--radius`, `--destructive`, and the fonts `--font-body`, `--font-heading`, `--font-mono`. For lib docs, `theme.preset`, `neutral`, and `primary` in `app.config` stay as shortcuts that write these variables.
2. **Docs surfaces (Ginko, derived):** `--docs-frame`, `--docs-panel`, `--docs-chip`, `--docs-tone-*`, `--sidebar*`, and the geometry tokens. Each defaults to a `color-mix()` of the brand variables. Hosts may override them.
3. **Surface setting:** `theme.surface: "framed" | "quiet"` redefines only surface tokens. It replaces `prose.appearance` and every per-component `appearance` prop.

Removed from the core theme: `--hero-*`, `--accent-{blue,mint,yellow,coral}*`, `--home-radius-*`, and the matching `--color-*` and `--radius-{card,section,panel}` theme entries. They move to the landing page (`layer/app/pages/index.vue` and its components) or go away.

Styling hooks are the tokens, the layout variables, and the `data-docs-*` attributes. Class names, element nesting, and label text are not part of the contract.

## Component sets

`@lupinum/ginko-docs/component-kit` exists today (PR #70) for sites that use Ginko Content without the layer. It registers the callouts, excerpt, aside, column, layout, flow, and figure, and loads `component-kit.css`. rolfing's content uses exactly: layout, column, figure, flow, accordion, aside, note, excerpt.

- **editorial** = the component kit today plus `center`, `accordion`, `accordion-item`, `cards`, `card`, `steps`. That covers rolfing and the proposal's list.
- **docs** = every component in `layer/tags.ts`.

The section module (05b) takes `components: "docs" | "editorial"`; the layer uses `docs`. The component kit module stays as the way to get the editorial set without the docs shell.

## Breaking changes and migration

Pre-1.0 release candidate: direct cutover with migration notes, no compatibility layer.

| Change | Consumers | Migration |
| --- | --- | --- |
| `prose.appearance` → `theme.surface` (`tint` → `framed`, `quiet` → `quiet`) | rolfing, rolfing-new (`quiet`); others use the default | Rename the setting |
| Per-component `appearance` prop removed | ginko-docs demo pages; rolfing `4.layout-labor/2.magazin-layouts.md` (2 × `appearance="tint"` on `Aside`) | Delete the attribute |
| `::toc` removed | ginko-docs demo pages only | Delete the tag; the page TOC stays |
| Tabs `layout="line"` removed (one selected chip everywhere) | ginko-docs demo pages only (search consumers before brief 04c) | Delete the attribute |
| Layout `type` border values removed | ginko-docs demo pages only; `fh_neu` uses the default | Remove `type`; use cards inside columns for boxes |
| Landing tokens leave the core theme | Sites that read `--hero-*` or `--accent-*` in their own CSS | Search before brief 02 (open item) |
| Private imports `#ginko-docs/features/search/useCommandCenter`, `#ginko-docs/composables/useSiteNavigation` | rolfing `app/components/SiteHeader.vue` | Use `useDocsSearch()` and `useDocsNavigation()` (brief 01) |
| `data-active`, `data-toc-active`, `aside[data-variant]` markup | rolfing CSS; release certification scripts | Use `aria-current="page"`, `data-docs-active`, `[data-docs-sidebar]` |

## Open items

- Which lib docs sites read `--hero-*` or `--accent-*` tokens directly (search the lupinum-dev repositories before brief 02).
- Search across host collections: resolved. Ginko Content 1.0.0-beta.9 search results carry `collection`, so the section groups them itself (brief 05b).
- Visual editing for clients is out of scope; revisit with ginko-editor.
