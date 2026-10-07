# Brief 04e: layout blocks, removals, component sets, surface gallery

Goal: layout, column, flow, and center have no chrome by default (only `surface="muted" | "tint"`); the inline `toc` component and the five border types are gone; the editorial component set is defined and the component kit registers it; the showcase shows every component in both surfaces; the temporary `data-appearance` bridge from brief 02 is removed.

Depends on: 04d. Release check: **yes** (component kit contents, policy, and fixture change).

Prototype reference: pages "Layouts and flow" and "Gallery". CSS: `.layout*`, `.col*`, `.center-block`, `.flow*`, `.fig[data-bleed]` (prototype lines 403 to 453).

## Read first

- [plan.md](../plan.md) "Component sets" and "Breaking changes"
- [contracts.md](../contracts.md) section 2
- `layer/app/components/mdc/MdcLayout.vue`, `MdcColumn.vue`, `MdcFlow.vue`, `MdcCenter.vue`, `MdcFigure.vue`, `MdcInlineToc.vue`
- `layer/app/features/docs/toc-context.ts`, `DocsPageContent.vue` (the `provide(docsTocKey, ...)`)
- `layer/app/assets/css/component-kit.css` (layout, column, flow, and the `data-type` rules at lines 158 to 172, 215 to 222, and 656 onward)
- `layer/app/assets/css/prose.css` ("Inline TOC" at about line 2812 and the comment at line 1065; the shared object rules and the accordion, cards, steps sections from briefs 04b and 04c)
- `layer/tags.ts`, `layer/authoring.ts`, `layer/component-kit.ts`, `layer/components.ts`, `layer/package.json` (`exports`)
- `layer/app/composables/useProseAppearance.ts` and its test
- `scripts/certify-component-kit.mjs`
- Docs pages: `8.components/*` and `8.komponenten/*` (both locales)

## Scope

Allowed: the files above; `layer/component-sets.ts` (new, and add it to `files` in `layer/package.json`); `layer/authoring.test.ts` and `layer/component-kit.test.ts` (they read the kit metadata and stylesheet list); the generated `authoring.generated.ts` through `pnpm build:authoring`.

Forbidden: the layout API from PR #70 other than the `type` removal (keep `align`, `gap`, `stack`, `surface`, column `size`, `align`, `media`, flow `width`, `surface`, figure `placement`, `bleed`, `frame`, `focus`).

## Changes

### 1. Layout blocks without chrome

In `component-kit.css`:

- Delete every `[data-type=...]` rule for `.content-layout-row` and `.content-layout-column` (card, border, border-dashed, outline, outline-dashed).
- Surfaces use the tile and brand tokens:

```css
.content-layout-row:is([data-surface="muted"], [data-surface="tint"]),
.content-flow:is([data-surface="muted"], [data-surface="tint"]) {
  padding: 22px;
  border-radius: var(--docs-radius-frame);
}
.content-layout-row[data-surface="muted"],
.content-flow[data-surface="muted"] {
  background: var(--docs-tile);
}
.content-layout-row[data-surface="tint"],
.content-flow[data-surface="tint"] {
  background: var(--docs-brand-soft);
}
```

  Replace the existing surface rules (`var(--muted)` and `color-mix(in oklab, var(--primary) 10%, var(--background))`) with these. Keep the `var(--brand-variable, fallback)` fallbacks that `component-kit.css` has for brand variables: kit hosts may not define every brand variable (the kit fixture defines none), and the literal test allows fallbacks.
- Gap values: `none` 0, `sm` 12 px, `md` 20 px (default), `lg` 32 px. Check the current values and change them only if they differ.
- Column `media="cover"`: the column stretches (`align-self: stretch`), the figure inside fills it (`flex: 1; display: flex; flex-direction: column`), and the media has `flex: 1; min-height: 220px; aspect-ratio: auto`. The selector must win over the figure's aspect-ratio rule (the prototype had this bug; prefix with `.content-layout`).

`MdcLayout.vue` and `MdcCenter.vue`: remove the `type` prop, its types, and `data-type`. `MdcCenter` keeps `size` and `max`: `text-align: center; margin-inline: auto; display: flex; flex-direction: column; align-items: center; gap: 12px; padding-block: 8px`; its `h2`/`h3` `margin: 0; font-size: 1.25rem; font-weight: 600; letter-spacing: -0.015em; text-wrap: balance`; its `p` `margin: 0`.

`tags.ts`: remove `type` from `layout` and `center`. `authoring.ts`: remove `type` from `authoring.layout.props`, and update `layer/authoring.test.ts` where it reads that metadata.

### 2. Remove the inline TOC

Delete `MdcInlineToc.vue`, the `toc` entry in `contentComponentTags` and `contentComponentPolicy`, its CSS ("Inline TOC" section and the comment near line 1065 in `prose.css`), and every `::toc` / `<Toc>` use and explanation in docs pages (both locales). If `toc-context.ts` and `provide(docsTocKey, ...)` have no other consumer after that, delete them too.

### 3. Component sets

Create `layer/component-sets.ts`:

```ts
import {
  contentComponentTags as ginkoDocsComponentTags,
  type ContentComponentTag as GinkoDocsComponentTag,
} from "./tags";

/** Components for client websites: text blocks, media, layout, and a few objects. */
export const editorialComponentTags = [
  "note",
  "info",
  "success",
  "warning",
  "error",
  "idea",
  "aside",
  "excerpt",
  "figure",
  "layout",
  "column",
  "flow",
  "center",
  "accordion",
  "accordion-item",
  "cards",
  "card",
  "steps",
] as const satisfies readonly GinkoDocsComponentTag[];

export const ginkoDocsComponentSets = {
  editorial: editorialComponentTags,
  docs: Object.keys(ginkoDocsComponentTags) as GinkoDocsComponentTag[],
} as const;

export type GinkoDocsComponentSet = keyof typeof ginkoDocsComponentSets;
```

Export it from `layer/components.ts`. Avoid the component-barrel import cycle: `component-sets.ts` must import the tag map and its type from `./tags` (as above), never from `components.ts`, or the re-export runs `Object.keys` before the map is initialized.

The component kit becomes the editorial set:

- `authoring.ts`: add `implementation` and `policy` entries for `center`, `accordion`, `accordion-item`, `cards`, `card`, `steps`, following the existing pattern, and these `authoring` entries (props use only the controls that exist today: `text` and `select`):

| Tag | label | description | props (control, label) | slots |
| --- | --- | --- | --- | --- |
| `center` | Centered block | A short centered message, such as a closing call to action. | `size` (select, Width) | default: Content |
| `accordion` | Accordion | Questions or details that readers open one at a time. | none | default: Items |
| `accordion-item` | Accordion item | One question and its answer. | `title` (text, Question) | default: Answer |
| `cards` | Cards | A grid of cards that link to related pages. | `cols` (text, Columns) | default: Cards |
| `card` | Card | A title, a short text, and an optional link. | `title` (text, Title), `description` (text, Description), `to` (text, Link), `icon` (text, Icon) | default: Content |
| `steps` | Steps | Numbered steps for a procedure. | none | default: Steps |

  Also add them to the `policy.components` of the kit source. Run `pnpm build:authoring`.
- Derive the kit's list from `editorialComponentTags` instead of repeating names, if the existing structure allows it without changing the public `ginkoDocsAuthoringKitSource` shape. Otherwise keep the explicit object and add a unit test that fails when the keys of `ginkoDocsAuthoringKitSource.implementation` and `editorialComponentTags` differ. Wrong behavior it catches: the kit and the section module (brief 05b) register different editorial sets.
- CSS: the kit loads only `docs-tokens.css` and `component-kit.css`. Move the CSS the new kit components need from `prose.css` to `component-kit.css`: the shared object rules (`.docs-frame`, `.docs-frame-head`, `.docs-frame-foot`, `.docs-frame-title`, `.docs-panel`, `.docs-icon-tile`, `.docs-ghost-button`), and the center, accordion, cards, and steps sections. `prose.css` must not keep a second copy. The layer keeps loading both files.
- `scripts/certify-component-kit.mjs`: update the expected `data-authoring-tags` string (about line 153) to the new sorted kit list; in the fixture page, replace `<MdcLayout type="border">` with `<MdcLayout>`, and add one `MdcCenter`, one `MdcAccordion` with one `MdcAccordionItem`, one `MdcCards` with one `MdcCard`, and one `MdcSteps` with two steps. Assert that each renders (a stable class or `data-slot` of each root is present) and that the fixture has no console errors.

### 4. Remove the bridge

Delete `layer/app/composables/useProseAppearance.ts` and its test. `git grep -n "data-appearance\|useProseAppearance" -- layer` must return nothing: remove every remaining `data-appearance` attribute and CSS selector. Components that still depend on an appearance difference are a bug from briefs 04a to 04d: fix them with tokens, and list them in the pull request.

### 5. Surface gallery

In `8.components/3.component-showcase.md` and `8.komponenten/3.komponenten-showcase.md`, add a section at the end:

- English heading `Both surfaces`, text: `The same components with the quiet surface. Sites choose one surface for all pages with theme.surface.`
- German heading `Beide Oberflächen`, text: `Dieselben Komponenten mit der ruhigen Oberfläche. Websites wählen mit theme.surface eine Oberfläche für alle Seiten.`
- Then one example each of: callout (info), aside, code block with file name, code group, table, cards (two), tabs, accordion, steps, API panel, figure, wrapped in a block that sets `data-docs-surface="quiet"`. Use raw HTML `<div data-docs-surface="quiet">` … `</div>` around the Markdown. If Ginko Content does not render components inside raw HTML, use `::div{data-docs-surface="quiet"}` … `::`. If neither works, stop and report.

Also update `8.components/4.editorial-layouts.md` and `5.magazine-layouts.md` (both locales): remove every `type="card"`, `type="border"`, `type="border-dashed"`, `type="outline"`, `type="outline-dashed"`; where a page explains the border types, replace the explanation with: English `Layouts have no border or background. Use surface="muted" or surface="tint" for a background, and cards inside columns for boxes.` German `Layouts haben keinen Rahmen und keinen Hintergrund. Nutze surface="muted" oder surface="tint" für einen Hintergrund und Karten in Spalten für Boxen.`

## Done when

- `git grep -n "data-appearance\|useProseAppearance\|MdcInlineToc\|border-dashed\|outline-dashed" -- layer docs scripts` returns nothing.
- The showcase's new section renders quiet components inside the framed page, in both locales, both schemes.
- The layout pages look like the prototype's "Layouts and flow" page: no borders, surfaces only where set, cover media fills its column, bleed figures reach past the text column on wide screens.
- The component kit fixture renders all editorial components (`pnpm release:verify`).
- `pnpm verify` and `pnpm release:verify` pass; `shots.mjs` exits 0.

## Commits

1. `feat(components)!: layout blocks without chrome`
   Body: `BREAKING CHANGE: layout and center no longer accept type (card, border, border-dashed, outline, outline-dashed). Use surface or cards inside columns.`
2. `feat(components)!: remove the inline toc component`
   Body: `BREAKING CHANGE: the toc component is removed. The page table of contents stays.`
3. `feat(components): editorial component set in the component kit`
4. `refactor(components): remove the data-appearance bridge`
5. `docs(components): show every component in both surfaces`
