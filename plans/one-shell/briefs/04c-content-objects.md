# Brief 04c: cards, read more, tabs, accordion, steps, timeline, files, figure

Goal: the remaining content objects use the frame grammar from brief 04b. This brief is large: make one commit per object group as listed and report after each commit.

Depends on: 04b. Release check: **yes** (the figure is part of the component kit).

Prototype reference: the "Gallery" page, both surfaces. CSS: `.icon-sq`, `.cards`, `.card*`, `.readmore`, `.rm-row*`, `.ctabs`, `.acc*`, `.steps*`, `.timeline`, `.tl*`, `.files`, `.f-row*`, `.fig*` (prototype lines 150, 426 to 437, 455 to 529).

## Read first

- [contracts.md](../contracts.md) section 2; the "Shared object rules" in [04b](04b-code-and-tables.md) (`.docs-frame`, `.docs-frame-head`, `.docs-frame-foot`, `.docs-panel`, `.docs-tabs`, `.docs-tab`, `.docs-ghost-button`)
- `layer/app/components/mdc/MdcCard.vue`, `MdcCards.vue`, `MdcReadMore.vue`, `MdcTabs.vue`, `MdcTab.vue`, `MdcAccordion.vue`, `MdcAccordionItem.vue`, `MdcSteps.vue`, `MdcTimeline.vue`, `MdcTimelineItem.vue`, `MdcFiles.vue`, `MdcFigure.vue`
- `layer/app/assets/css/prose.css` sections "Cards", "Read more", "Accordion", "Tabs", "Files", "Figure / media", "Timeline", "Steps" (lines 1332 to 2000 and 2586 to 2811)
- `layer/app/assets/css/component-kit.css` lines 60 to 95 (figure `frame="none"`, focus)

## Scope

Allowed: the files above; `layer/tags.ts` and docs pages in `docs/content/**` (only for the tabs `layout` removal). Markup changes are allowed where a row below says so; keep every prop (except tabs `layout`, removed below), slot, emitted event, ARIA attribute, and keyboard behavior.

Forbidden: the API panel and quiz (brief 04d); layout, column, flow, center (brief 04e).

Common to every object here: delete `data-appearance`, the `useProseAppearance` call, and every `[data-appearance="quiet"]` / `[data-appearance="tint"]` rule for the object. Quiet must come from the tokens alone.

Add this shared rule to `prose.css`:

```css
.docs-icon-tile {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: var(--docs-tile);
  border: 1px solid var(--docs-tile-border);
  border-radius: calc(var(--radius) - 1px);
  color: var(--foreground);
}
```

(`docs-shell.css` has the same rule from brief 03c for the search dialog. Keep one definition: move it to `prose.css` if `prose.css` loads in every place the dialog renders, otherwise keep it in `docs-shell.css` and import nothing twice. Record the choice.)

The tile uses `--docs-tile` and `--docs-tile-border` (contracts section 2): the frame color when framed, `--muted` when quiet.

## 1. Cards (`MdcCards.vue`, `MdcCard.vue`)

| Prototype | Layer |
| --- | --- |
| `.cards` grid, `repeat(var(--cols, 2), minmax(0, 1fr))`, gap 12 px, one column below 40rem container width | `.content-cards` (keep the `cols` prop mapping) |
| `.card.frame` | root `.content-card` gets `docs-frame` and `display: flex; flex-direction: column` |
| `.card .panel`: `position: relative; flex: 1; padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 4px` | `.content-card-surface` gets `docs-panel` |
| `.icon-sq` with `margin-bottom: 8px` | `.content-card-tile` gets `docs-icon-tile` (keep `iconColor` support: it sets the icon color only) |
| title `font-weight: 600; font-size: 0.90625rem` | `.content-card-title` |
| description `font-size: 0.84375rem; color: var(--muted-foreground)` | `.content-card-description` |
| body `font-size: 0.875rem; margin-top: 6px; color: color-mix(in oklab, var(--foreground) 84%, var(--muted-foreground))` | `.content-card-body` |
| `.frame-foot` with footer text and a `lucide:arrow-right` at the end | **Markup change:** move `.content-card-footer` out of `.content-card-surface` to directly after it, class `docs-frame-foot`; when the card links (`to`), add `lucide:arrow-right` (14 px) at the end of the foot |
| `.go` corner arrow `lucide:arrow-up-right` at `top: 16px; inset-inline-end: 14px`, panel `padding-inline-end: 40px` | `.content-card-arrow`, only when linked and without footer |
| hover (linked): frame `border-color: var(--docs-border-strong)`, arrow moves 2 px toward the end (`transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1)`) and turns `var(--foreground)` | `a.content-card:hover` |
| `.card.horizontal .panel`: `flex-direction: row; align-items: flex-start; gap: 12px`, tile without bottom margin | `horizontal` prop |
| media image | `.content-card-media`: full width at the top of the panel, `border-radius: calc(var(--docs-panel-radius) - 1px)`, `margin-bottom: 10px` |

Keep `content-card-in-stack` (cards inside tabs or code trees): there the root has no frame (`padding: 0; background: none; border: 0`), only the panel.

## 2. Read more (`MdcReadMore.vue`)

- Root gets `docs-frame`; optional title in a `docs-frame-head` (`docs-frame-title` with the title text); the list gets `docs-panel` with `padding: 4px; display: flex; flex-direction: column; gap: 1px`.
- Each link row: `display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: var(--docs-radius-row); text-decoration: none`; hover `background: var(--muted)`. Icon in `docs-icon-tile`. Label `font-weight: 500; font-size: 0.90625rem; display: block`; description `font-size: 0.8125rem; color: var(--muted-foreground); display: block`. Arrow `lucide:arrow-right` at the end, muted, `var(--foreground)` on hover.

## 3. Tabs (`MdcTabs.vue`, `MdcTab.vue`)

- Root gets `docs-frame`; the header gets `docs-frame-head`; the tab list `docs-tabs`; each tab `docs-tab` (keep icons, `role="tab"`, `aria-selected`, arrow-key behavior).
- The panels wrapper gets `docs-panel`; the active panel content has `padding: 14px 16px` and `> * + * { margin-top: 10px }`.
- `layout="line"` (underline tabs) is removed, because every selected tab uses the one chip (plan.md, design rule 5). Delete the `layout` prop from `MdcTabs.vue` and `tags.ts`, its CSS, and every use and explanation in docs pages (English and German).
- `padded` stays as it is (it controls panel padding).

## 4. Accordion (`MdcAccordion.vue`, `MdcAccordionItem.vue`)

- Root gets `docs-frame`; the item list gets `docs-panel`; items after the first have `border-top: 1px solid var(--border)`.
- Trigger: `display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; font-size: 0.90625rem; font-weight: 500; text-align: start`; hover `background: color-mix(in oklab, var(--muted) 60%, transparent)`; focus `outline: 2px solid var(--ring); outline-offset: -2px`.
- Chevron `lucide:chevron-down` at the end, muted, `transform: rotate(180deg)` when open, `transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1)`.
- Content: keep the reka animation (`accordion-content`); inner padding `0 14px 14px`, `font-size: 0.90625rem`, color `color-mix(in oklab, var(--foreground) 84%, var(--muted-foreground))`.
- The header stays an `h3` for document structure (existing comment in `prose.css`).

## 5. Steps (`MdcSteps.vue`)

Steps are a sequence, not a boxed object: no frame. Marker tiles use the tile tokens.

```css
.content-steps {
  counter-reset: step;
  margin-block: 1.25rem;
  padding: 0;
  list-style: none;
}
.content-step {
  position: relative;
  padding-inline-start: 44px;
  padding-bottom: 12px;
  counter-increment: step;
}
.content-step-marker {
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: var(--docs-tile);
  border: 1px solid var(--docs-tile-border);
  border-radius: calc(var(--radius) - 1px);
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.content-step::after {
  content: "";
  position: absolute;
  inset-inline-start: 14px;
  top: 34px;
  bottom: 4px;
  width: 1px;
  background: var(--border);
}
.content-step:last-child::after {
  display: none;
}
.content-step-title {
  margin: 2px 0 0;
  font-size: 1rem;
  font-weight: 600;
}
.content-step-body {
  margin-top: 6px;
}
```

Keep the existing `mode` and icon markers (an icon marker uses the same tile). Delete the old "canonical quiet rail" and the tint chip-and-bar variant.

## 6. Timeline (`MdcTimeline.vue`, `MdcTimelineItem.vue`)

- Root gets `docs-frame`; the list gets `docs-panel` with `padding: 16px 16px 6px`.
- Item: `position: relative; padding: 0 0 18px; padding-inline-start: 40px`; connector `::after` at `inset-inline-start: 13px; top: 30px; bottom: 2px; width: 1px; background: var(--border)`, none on the last item.
- Marker: `position: absolute; inset-inline-start: 0; top: 0; width: 27px; height: 27px; border-radius: 999px; display: grid; place-items: center; background: var(--docs-panel); border: 1px solid var(--border); color: var(--muted-foreground)`; icon 14 px; dot marker: a 7 px circle in `var(--docs-border-strong)`.
- Active item (`active` prop): marker `background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); box-shadow: 0 0 0 4px var(--docs-brand-soft)`.
- Date row: `display: flex; align-items: center; gap: 8px; min-height: 27px; font-size: 0.78125rem; color: var(--muted-foreground)` (the label chip, if any, uses `.content-chip`).
- Title `display: block; margin-top: 2px; font-size: 0.9375rem; font-weight: 600`; body `margin-top: 2px; font-size: 0.90625rem; color: color-mix(in oklab, var(--foreground) 84%, var(--muted-foreground))`.
- Delete the old quiet and tint timeline variants ("the bar IS the timeline", the accent segment).

## 7. Files (`MdcFiles.vue`)

- Root gets `docs-frame`; the list gets `docs-panel` with `padding: 6px; font-size: 0.84375rem`.
- Row: `display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 8px; border-radius: calc(var(--radius) - 3px); font-family: var(--font-mono); font-size: 0.8rem`; icon 15 px muted; folders use `var(--foreground)` for the icon.
- Nested rows: nesting is rendered as recursive lists (`renderEntries`, no depth value); indent each nested list by 22 px (`padding-inline-start: 22px` on the nested list).
- Active file (`active` prop): `background: var(--docs-brand-soft); color: var(--foreground); font-weight: 500`, icon `var(--primary)`.
- Annotation: `margin-inline-start: auto; font-family: var(--font-body); font-size: 0.78125rem; font-weight: 400; color: var(--muted-foreground)`.

## 8. Figure (`MdcFigure.vue`, CSS in `component-kit.css`)

Two looks, chosen by the existing `frame` prop:

- `frame="default"` (object): root gets `docs-frame`; the media button sits in a `docs-panel`; the caption becomes a `docs-frame-foot` (`figcaption`, `font-size: 0.8125rem`, `text-wrap: pretty`, `color: var(--muted-foreground)`). The image radius inside the panel is `calc(var(--docs-panel-radius) - 1px)`.
- `frame="none"` (editorial): no frame; media `border-radius: 12px; overflow: hidden; background: var(--muted)`; caption below with `margin-top: 8px; font-size: 0.8125rem; color: var(--muted-foreground)`.
- Aspect ratios: `video` 16/9, `square` 1, `portrait` 4/5, `wide` 21/9 (keep the existing mapping if it already matches; otherwise use these).
- The media is a button with `cursor: zoom-in` when zoom is on (keep `ImageZoomDialog` and its label).
- Keep `placement`, `bleed`, and `focus` behavior from PR #70 (they are layout, brief 04e checks them).

## Done when

- Every object on the showcase page matches the prototype gallery in both surfaces (set quiet locally) and both schemes. Pull request: side-by-side screenshots per object group, 1440 light and dark, 375 light.
- `git grep -n "data-appearance" -- layer/app/components/mdc/MdcCard.vue layer/app/components/mdc/MdcCards.vue layer/app/components/mdc/MdcReadMore.vue layer/app/components/mdc/MdcTabs.vue layer/app/components/mdc/MdcAccordion.vue layer/app/components/mdc/MdcSteps.vue layer/app/components/mdc/MdcTimeline.vue layer/app/components/mdc/MdcFiles.vue layer/app/components/mdc/MdcFigure.vue` returns nothing.
- `pnpm verify` and `pnpm release:verify` pass; `shots.mjs` exits 0.

## Commits

1. `feat(components): frame cards and read more`
2. `feat(components)!: frame tabs and accordion, drop line tabs`
   Body: `BREAKING CHANGE: the tabs layout="line" option is removed.`
3. `feat(components): steps and timeline on tile markers`
4. `feat(components): frame files and figures`
