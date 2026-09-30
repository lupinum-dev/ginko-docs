# Brief 03c: top bar, search dialog, docs drawer

Goal: the top bar, the search dialog, and the mobile docs drawer use the frame grammar and the new values. Behavior stays the same.

Depends on: 03b. Release check: **yes** (the certification clicks the search button, the menu button, and the dialog).

Prototype reference: `.topbar*`, `.topnav`, `.search-btn`, `.icon-btn`, `.overlay`, `.cmd*`, `.sheet*` (prototype lines 197 to 220 and 634 to 654). Open the search with ⌘K and the drawer at 375 px.

## Read first

- [contracts.md](../contracts.md) sections 2, 9
- `layer/app/components/site/SiteHeader.vue`
- `layer/app/features/search/components/SiteCommandCenter.vue`
- `layer/app/features/docs/components/DocsMobileToc.vue` (the left drawer and the bottom TOC sheet)
- `layer/app/components/ui/sheet/SheetContent.vue`, `SheetOverlay.vue`
- `layer/app/components/ui/kbd/*`

## Scope

Allowed: the files above, `layer/app/components/site/SiteLocaleSwitcher.vue`, `SiteSocialLinks.vue`, `ModeToggle.vue` (their trigger buttons live there), and `layer/app/assets/css/docs-shell.css`.

Forbidden: the full-screen mobile site menu inside `SiteHeader.vue` (the `Sheet` with the large menu type: keep it exactly as it is); search logic, grouping, keyboard handling, and result content; `SiteFooter.vue`; the landing page.

## Changes

### 1. Top bar (`SiteHeader.vue`, desktop parts only)

```css
.docs-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--site-header-height);
  background: color-mix(in oklab, var(--background) 86%, transparent);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--border);
}
.docs-shell[data-docs-shell="inset"] .docs-topbar {
  background: color-mix(in oklab, var(--docs-ground) 86%, transparent);
  border-bottom-color: transparent;
}
.docs-topbar-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding-inline: 16px;
}
.docs-topnav-link {
  padding: 6px 10px;
  border-radius: var(--docs-radius-row);
  font-size: 0.875rem;
  color: var(--muted-foreground);
  text-decoration: none;
}
.docs-topnav-link:hover {
  background: var(--muted);
  color: var(--foreground);
}
.docs-topnav-link[aria-current] {
  color: var(--foreground);
  font-weight: 500;
}
.docs-search-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(280px, 32vw);
  height: 34px;
  padding: 0 6px 0 10px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--docs-radius-panel);
  font-size: 0.875rem;
  color: var(--muted-foreground);
}
.docs-search-button:hover {
  border-color: var(--docs-border-strong);
  color: var(--foreground);
}
.docs-search-button kbd {
  height: 20px;
  min-width: 20px;
  padding: 0 5px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.6875rem;
  color: var(--muted-foreground);
}
.docs-icon-button {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--docs-radius-row);
  color: var(--muted-foreground);
}
.docs-icon-button:hover {
  background: var(--muted);
  color: var(--foreground);
}
:is(.docs-topnav-link, .docs-search-button, .docs-icon-button):focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

- The `<header>` gets `docs-topbar`; its inner container gets `docs-topbar-inner` and loses `mx-auto max-w-screen-2xl px-4 min-[691px]:px-6` (the bar is full width like the shell).
- Top navigation links get `docs-topnav-link`. Today the active link is marked only by `isActive()` classes (around line 144); bind `:aria-current="isActive(item) ? 'page' : undefined"` (use the component's existing active check, which also covers child routes) and remove the filled background classes. The prototype marks it with color and weight only.
- The wide search button gets `docs-search-button`; keep its label, `Kbd`, and the `min-[691px]` visibility rules.
- The small search button and the mobile menu trigger (in `SiteHeader.vue`), the mode toggle trigger (`ModeToggle.vue`, default variant only), the language switcher trigger (`SiteLocaleSwitcher.vue`, default variant only), and the social icon links (`SiteSocialLinks.vue`) get `docs-icon-button` (34 × 34). Do not change their `menu-row` variants used by the mobile menu. Keep their `aria-label`s and visibility breakpoints.
- The inset rule works because the header renders inside `.docs-shell`. Check that the header on non-docs layouts (`default.vue`, `blog.vue`) still looks correct: they have no `.docs-shell`, so they get the standalone values.

### 2. Search dialog (`SiteCommandCenter.vue`)

```css
.docs-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--docs-overlay);
}
.docs-dialog {
  position: fixed;
  top: 12vh;
  left: 50%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: min(560px, calc(100vw - 32px));
  max-height: 76vh;
  padding: var(--docs-frame-pad);
  transform: translateX(-50%);
  background: var(--docs-frame);
  border: 1px solid var(--docs-frame-border);
  border-radius: var(--docs-radius-dialog);
  box-shadow: var(--docs-shadow-pop);
}
.docs-dialog-panel {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: var(--background);
  border: 1px solid var(--docs-panel-border);
  border-radius: var(--docs-radius-frame);
}
.docs-dialog-input {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  color: var(--muted-foreground);
}
.docs-dialog-input input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 0.96875rem;
  color: var(--foreground);
}
.docs-dialog-list {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px;
}
.docs-dialog-group {
  padding: 8px 10px 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
}
.docs-dialog-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--docs-radius-row);
  text-align: start;
}
.docs-dialog-item[data-highlighted],
.docs-dialog-item[aria-selected="true"] {
  background: var(--muted);
}
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

- `DialogOverlay` gets `docs-dialog-overlay` (keep the fade animation classes). `DialogContent` gets `docs-dialog` (keep the open and close animation classes; remove `top-[8vh]`, `w-[min(94vw,44rem)]`, `rounded-xl`, `border`, `bg-*`, `shadow-*`). Wrap its children in `div.docs-dialog-panel`.
- The input row gets `docs-dialog-input`. Keep the icon, the `Esc` hint, and the close button.
- The result list gets `docs-dialog-list`. Group headers become `div.docs-dialog-group` with the group title and the count; remove the divider line (`border-t border-border/60`).
- Each result gets `docs-dialog-item`; use whichever attribute the component already sets for the highlighted item (it uses `highlightedId === item.id`; add `:data-highlighted="highlightedId === item.id || undefined"`). The icon box becomes `docs-icon-tile`.
- Keep the loading, error, and empty states, the match highlight, the breadcrumb line, and the keyboard hint on the highlighted item.

### 3. Docs drawer and TOC sheet (`DocsMobileToc.vue`)

The left drawer floats with an 8 px gap, like the prototype sheet:

```css
.docs-drawer {
  top: 8px;
  bottom: 8px;
  inset-inline-start: 8px;
  height: auto;
  width: min(320px, calc(100% - 48px));
  max-width: none;
  padding: 0;
  overflow: hidden;
  background: var(--sidebar);
  border: 1px solid var(--sidebar-border);
  border-radius: var(--docs-radius-dialog);
  box-shadow: var(--docs-shadow-pop);
}
.docs-drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 0 12px;
  font-size: 0.84375rem;
  font-weight: 600;
}
.docs-sheet-bottom {
  border-radius: var(--docs-radius-dialog) var(--docs-radius-dialog) 0 0;
  background: var(--background);
}
```

- Left `SheetContent`: add `docs-drawer`, remove `w-[var(--docs-sidebar-width)] max-w-[85vw]`. If `SheetContent`'s own side classes (`inset-y-0 left-0 h-full border-r`) win over `docs-drawer`, pass them through `cn` so the drawer classes come last, or add `!` only to the conflicting properties; record which one you used.
- The drawer header (`SheetTitle` row) gets `docs-drawer-head` and loses `border-b px-4 py-3`. The `DocsSidebar variant="drawer"` inside keeps the sidebar styles from brief 03a.
- The bottom TOC `SheetContent` gets `docs-sheet-bottom` instead of `rounded-t-2xl`.
- `SheetOverlay`: use `var(--docs-overlay)` for the background (in `SheetOverlay.vue`, replace the current background class with `bg-[var(--docs-overlay)]`). This also affects the full-screen site menu's overlay; check that it still looks right.

## Visible strings

None.

## Done when

- At 1440 px both schemes: top bar, search button, and icon buttons match the prototype values; the current top nav link has no fill.
- ⌘K opens the dialog: framed, 560 px wide, 12vh from the top, results grouped, highlighted row filled with `--muted`; Esc closes it and focus returns to the search button.
- At 375 px: the docs drawer floats with an 8 px gap and a rounded outline; the TOC sheet opens from the bottom; the full-screen site menu is unchanged (compare screenshots before and after).
- `pnpm verify` and `pnpm release:verify` pass; `shots.mjs` exits 0.

## Commits

1. `feat(shell): restyle the top bar`
2. `feat(search): frame the search dialog`
3. `feat(shell): float the mobile docs drawer`
