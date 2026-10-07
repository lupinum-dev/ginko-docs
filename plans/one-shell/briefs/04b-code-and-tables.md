# Brief 04b: code block, code group, code tree, collapse, tables

Goal: every code and table object uses the frame grammar: frame, head row, panel, foot row. The dark code theme keeps working, and the code tree list is valid HTML.

Depends on: 04a. Release check: no (unless certification fails in `pnpm verify`; then run it).

Prototype reference: page "Code blocks" and the tables on "Tokens" (both surfaces). CSS: `.frame`, `.frame-head`, `.frame-foot`, `.frame-title`, `.panel`, `.panel pre`, `.panel pre .hl`, `.tabs`, `.tree*`, `.collapse*`, `.panel table`, `.panel th`, `.panel td` (prototype lines 137 to 149, 303 to 331, 554 to 561).

## Read first

- [contracts.md](../contracts.md) section 2 ("Rules for using the tokens")
- `layer/app/components/prose/ProsePre.vue`, `ProseTable.vue`
- `layer/app/components/mdc/MdcCodeGroup.vue`, `MdcCodeTree.vue`, `MdcCollapse.vue`, `code-tree.utils.ts`
- `layer/app/assets/css/prose.css`: dark code scope (lines 341 to 370), codeblock (370 to 460 and 800 to 870), collapse (462 to 530), codegroup (605 to 810), tables (278 to 340 and 1040 to 1065), code tree (1087 to 1270 approximately)
- `layer/app/assets/css/docs-tokens.css`

## Scope

Allowed: the files above.

Forbidden: Shiki configuration and themes, syntax colors, copy logic, the `data-code-blocks` setting and its dark palette, table content parsing.

## Shared object rules

Add these once to `prose.css` (they are the frame grammar from contracts section 2, used by briefs 04b to 04d):

```css
.docs-frame {
  overflow: hidden;
  padding: var(--docs-frame-pad);
  background: var(--docs-frame);
  border: 1px solid var(--docs-frame-border);
  border-radius: var(--docs-radius-frame);
}
.docs-frame-head,
.docs-frame-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 8px 0 10px;
  font-size: 0.8125rem;
  color: var(--muted-foreground);
}
.docs-frame-head {
  border-bottom: var(--docs-head-rule) solid var(--border);
}
.docs-frame-foot {
  min-height: 34px;
  border-top: var(--docs-head-rule) solid var(--border);
}
.docs-frame-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-weight: 500;
  color: var(--foreground);
}
.docs-frame-title > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.docs-panel {
  overflow: hidden;
  background: var(--docs-panel);
  border: 1px solid var(--docs-panel-border);
  border-radius: var(--docs-panel-radius);
}
.docs-ghost-button {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: calc(var(--radius) - 3px);
  color: var(--muted-foreground);
}
.docs-ghost-button:hover {
  background: var(--docs-chip);
  color: var(--foreground);
}
.docs-ghost-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}
.docs-tabs {
  display: flex;
  gap: 2px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.docs-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 10px;
  border-radius: calc(var(--radius) - 3px);
  font-size: 0.78125rem;
  color: var(--muted-foreground);
  white-space: nowrap;
}
.docs-tab:hover {
  color: var(--foreground);
}
.docs-tab[aria-selected="true"],
.docs-tab[data-state="active"] {
  background: var(--docs-selected);
  box-shadow: var(--docs-selected-shadow);
  color: var(--foreground);
  font-weight: 500;
}
.docs-tab:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}
.docs-tab svg,
.docs-tab .iconify {
  width: 14px;
  height: 14px;
}
.docs-frame-head .docs-tabs {
  margin-inline-start: -6px;
}
```

Also give every object's outer element `margin-block: 1.25rem` unless it already has a margin from `.content-prose`.

## Dark code scope

The dark code theme re-scopes brand variables inside code objects (`html[data-code-blocks="dark"] :where(.content-codeblock, .content-codegroup, .content-code-tree)`). Derived tokens resolve on `:root`, so they must be re-declared in that scope. Move the dark code scope block from `prose.css` into `docs-tokens.css` (it sets brand variables, so it belongs with the tokens) and add after it:

```css
html[data-code-blocks="dark"] :where(.content-codeblock, .content-codegroup, .content-code-tree) {
  --docs-border-strong: color-mix(in oklab, var(--foreground) 16%, var(--background));
  --docs-chip: color-mix(in oklab, var(--foreground) 10%, var(--background));
  --docs-shadow-chip: 0 1px 2px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(1 0 0 / 0.06);
  --docs-panel: var(--background);
}
html[data-code-blocks="dark"]:not([data-docs-surface="quiet"]) :where(.content-codeblock, .content-codegroup, .content-code-tree) {
  --docs-frame: color-mix(in oklab, var(--foreground) 4%, var(--background));
  --docs-frame-border: color-mix(in oklab, var(--foreground) 7%, var(--background));
  --docs-panel-border: var(--border);
  --docs-selected: var(--docs-chip);
  --docs-selected-shadow: var(--docs-shadow-chip);
}
html[data-code-blocks="dark"][data-docs-surface="quiet"] :where(.content-codeblock, .content-codegroup, .content-code-tree) {
  --docs-frame: var(--background);
  --docs-frame-border: var(--border);
  --docs-selected: var(--muted);
}
```

This is the rule in [contracts.md](../contracts.md) section 2 ("Where brand variables are re-scoped").

## Changes per object

### Code block (`ProsePre.vue`)

| Prototype | Layer element |
| --- | --- |
| `.frame` | `figure.content-codeblock` gets `docs-frame` |
| `.frame-head` with `.frame-title` (file icon, file name) and the copy button | `figcaption` gets `docs-frame-head`; icon and label go inside `span.docs-frame-title` (`<Icon/>` then `<span>{{ label }}</span>`); a `span` with `flex: 1` pushes the copy button to the end; the copy button gets `docs-ghost-button` |
| `.panel` | the scroll wrapper (`.content-codeblock-scroll-wrap`) gets `docs-panel` |
| `.panel pre` | `padding: 14px 16px; font-size: 0.825rem; line-height: 1.7; tab-size: 2` |

- Plain code (no label): the frame has only the panel; the floating copy button stays at `top: 8px; inset-inline-end: 8px` inside the panel and uses `docs-ghost-button`.
- In a code group (`inGroup`), the code block renders only the panel content (no frame of its own).
- Highlighted lines (`.line.highlight`, `.line.highlighted`): `background: var(--docs-brand-soft); box-shadow: inset 2px 0 0 var(--primary)`, full width of the panel (keep today's full-width technique).
- Diff lines: keep today's rules; their colors come from `--docs-tone-success` and `--docs-tone-error` (brief 02 already moved `--chart-2`).
- Delete `[data-fd-codeblock] { background-color: var(--secondary) }` and the old `-with-caption` / `-plain` surface, border, and radius rules. Delete `data-appearance` and `useProseAppearance` from `ProsePre.vue`.

### Code group (`MdcCodeGroup.vue`)

- Root `.content-codegroup` gets `docs-frame`. Header gets `docs-frame-head`; the tab list gets `docs-tabs`; each tab `docs-tab` (keep `role="tab"`, `aria-selected`, icons); a flex spacer; the copy button `docs-ghost-button`.
- The panels wrapper gets `docs-panel`.
- Delete the old codegroup surface, border, header, and tab styles (`.content-codegroup-tab*` rules).

### Code tree (`MdcCodeTree.vue`, render function)

```css
.content-code-tree {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: var(--docs-frame-pad);
}
@container (max-width: 40rem) {
  .content-code-tree {
    grid-template-columns: minmax(0, 1fr);
  }
}
.content-code-tree-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  padding: 6px;
  list-style: none;
  font-size: 0.8125rem;
  background: var(--docs-panel);
  border: 1px solid var(--docs-panel-border);
  border-inline-end: max(var(--docs-head-rule), 1px) solid var(--docs-panel-border);
  border-radius: var(--docs-panel-radius);
}
.content-code-tree-row {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border-radius: calc(var(--radius) - 3px);
  color: var(--muted-foreground);
  text-align: start;
  white-space: nowrap;
}
.content-code-tree-row:hover {
  background: var(--muted);
  color: var(--foreground);
}
.content-code-tree-row-active,
.content-code-tree-row[aria-selected="true"] {
  background: var(--docs-selected);
  box-shadow: var(--docs-selected-shadow);
  color: var(--foreground);
  font-weight: 500;
}
```

In quiet, `--docs-panel-border` is transparent, so the list needs a visible divider to the code: use `border-inline-end: var(--docs-head-rule) solid var(--border)` in addition (quiet sets `--docs-head-rule: 1px`). Resolve the two `border-inline-end` declarations into one that works in both surfaces and record the final rule in the pull request.

- The root gets `docs-frame` plus `content-code-tree`. The code pane (`.content-code-tree-pane`) gets `docs-panel`.
- Folder rows use the foreground color. Nesting is rendered as recursive lists (`renderRows`, no depth value): indent each nested list with `.content-code-tree-branch { margin: 0; padding: 0; padding-inline-start: 18px; list-style: none; }`.
- **Fix the axe `list` violation:** `renderRows` gives every `li` `role="none"` (around lines 128 and 163). An `li` with `role="none"` is not a list item, so the plain `ul` fails. Remove `role: "none"` from those `li` elements (the buttons inside keep their own semantics). If the nested lists carry `role="group"`, remove that too unless the list has tree roles.
- Keep keyboard behavior, `role`s, and selection logic.

### Collapse (`MdcCollapse.vue`)

- Root gets `docs-frame`; the region gets `docs-panel` and `position: relative`.
- Collapsed: the region clips at `max-height: 220px`; the fade is `position: absolute; inset: auto 0 0 0; height: 72px; background: linear-gradient(to bottom, transparent, var(--docs-panel)); pointer-events: none`.
- The button row becomes a foot row: `div.docs-frame-foot` with `justify-content: center`; the button is `.docs-tab`-sized text (`font-size: 0.8125rem; font-weight: 500; color: var(--foreground)`; hover `background: var(--docs-chip)`; radius `calc(var(--radius) - 3px)`; padding `0 10px`; height 28 px). Keep its label (`docs.showAllLines`) and `aria-controls`.
- When the collapse wraps a single code block, the inner code block must not draw a second frame: add `.content-collapse .content-codeblock { padding: 0; background: none; border: 0; }` and keep its panel.

### Tables (`ProseTable.vue`)

- `.content-table` gets `docs-frame`; `.content-table-scroll` gets `docs-panel` and `overflow-x: auto`.

```css
.content-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.content-table th {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--muted-foreground);
  text-align: start;
  white-space: nowrap;
}
.content-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.content-table tbody tr:last-child td {
  border-bottom: 0;
}
.content-table tbody tr:hover td {
  background: color-mix(in oklab, var(--muted) 50%, transparent);
}
.content-table td :where(code) {
  padding: 2px 6px;
  font-size: 0.78125rem;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  white-space: nowrap;
}
```

Keep the atomic code chip rule (lines 323 to 340) and the scrollbar styling; delete the old table surface and border rules.

## Done when

- The "Code blocks" demos in the showcase (code block with and without file name, code group, code tree, collapse) and every table match the prototype in both surfaces and both schemes, with `codeBlocks: "dark"` (default) and `codeBlocks: "adaptive"` (local only).
- The axe `list` violation from the baseline is gone.
- `git grep -n "data-appearance" -- layer/app/components/prose/ProsePre.vue layer/app/components/mdc/MdcCodeGroup.vue layer/app/components/mdc/MdcCodeTree.vue layer/app/components/mdc/MdcCollapse.vue` returns nothing.
- `pnpm verify` passes; `shots.mjs` exits 0.

## Commits

1. `feat(components): shared frame, panel, and tab styles`
2. `feat(components): frame code blocks, code groups, and collapse`
3. `fix(components): valid list markup and frame for the code tree`
4. `feat(components): frame tables`
