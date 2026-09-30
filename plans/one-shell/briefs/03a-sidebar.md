# Brief 03a: sidebar

Goal: the sidebar matches the prototype: one 32 px row for every level, children inside a neutral line, one filled chip for the current page, icons on top-level rows only, sentence-case group labels, section tabs that never truncate, and a sidebar background that reaches the viewport edge.

Depends on: 02. Release check: **yes** (certification selectors change).

Prototype reference: open `reference/prototype.html`, any page, "Standalone" and "Inset" placements, both surfaces. CSS: the `.sidebar`, `.side-top`, `.side-scroll`, `.group*`, `.row`, `.sub*`, `.seg` rules (prototype lines 165 to 169 and 227 to 252).

## Read first

- [contracts.md](../contracts.md) sections 2, 5, 8, 9
- `layer/app/layouts/docs.vue`
- `layer/app/features/docs/components/DocsSidebar.vue`, `DocsSidebarItem.vue`, `DocsSidebarRow.vue`, `DocsSidebarTabs.vue`, `DocsSidebarDropdown.vue`, `DocsSidebarList.vue`
- `layer/app/components/ui/tabs/*`, `ui/dropdown-menu/DropdownMenuContent.vue`, `ui/dropdown-menu/DropdownMenuRadioItem.vue`
- `layer/i18n/messages/global/docs.ts`
- `scripts/certify-packed-fixtures.mjs` (sidebar checks)

## Scope

Allowed: the files above; `layer/app/assets/css/docs-shell.css` (new); `layer/app/assets/css/tailwind.css` (import line and `--docs-sidebar-width-expanded`); `layer/component-kit.ts` is **not** touched (the kit has no shell).

Forbidden: changing navigation data, sorting, or which sections exist; changing the header, TOC, or page (briefs 03b and 03c).

## Changes

### 1. New stylesheet

Create `layer/app/assets/css/docs-shell.css`, wrap everything in `@layer components { ... }`, and import it in `tailwind.css` directly after `docs-tokens.css`. Brief 03b and 03c add to this file. Use logical properties (`inset-inline-start`, `margin-inline-start`, `padding-inline`, `border-inline-start`) so right-to-left works.

### 2. Width and full-bleed

- `tailwind.css`: `--docs-sidebar-width-expanded: 17rem;`
- `layouts/docs.vue`: remove `mx-auto max-w-screen-2xl` from the flex wrapper around the sidebar and the page, so the sidebar starts at the viewport edge at every width. (Brief 03b centers the article and TOC inside the stage.)

### 3. Sidebar anatomy

Markup shape (keep existing components; change classes and add wrappers where needed):

```
aside[data-docs-sidebar]  .docs-sidebar
  div.docs-sidebar-top            (only when the section switcher shows)
    <switcher>
  ScrollArea  (viewport class: docs-sidebar-scroll)
    div.docs-sidebar-groups
      section.docs-sidebar-group          (one per navigation group)
        p.docs-sidebar-group-title[data-slot="docs-sidebar-group-title"]   (only when the group has a title)
        div.docs-sidebar-group-body
          DocsSidebarItem × n
```

CSS (add to `docs-shell.css`):

```css
.docs-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--sidebar);
  border-inline-end: 1px solid var(--sidebar-border);
  color: var(--sidebar-foreground);
  font-size: 0.84375rem; /* 13.5px */
}
.docs-sidebar[data-docs-sidebar="drawer"] {
  border-inline-end: 0;
}
.docs-sidebar-top {
  padding: 12px 12px 8px;
}
.docs-sidebar-scroll {
  padding: 4px 12px 16px;
  overscroll-behavior: contain;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    var(--foreground) 10px,
    var(--foreground) calc(100% - 16px),
    transparent
  );
}
.docs-sidebar-groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.docs-sidebar-group-title {
  margin: 0;
  padding: 0 10px 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
}
.docs-sidebar-group-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: var(--docs-sidebar-group-pad);
  background: var(--docs-sidebar-group);
  border: 1px solid var(--docs-sidebar-group-border);
  border-radius: calc(var(--radius) + 2px);
}
```

Remove the old Tailwind classes these replace (the aside's `border-e`, the group title's `uppercase tracking-wider text-[11px] font-semibold mt-5 mb-1.5`, the scroll viewport's `p-4` and mask).

### 4. Rows

One row style for every depth. Apply `.docs-row` to the `NuxtLink` or `Button` root in `DocsSidebarItem.vue`, and replace the whole `linkRowClass` computed with it (no depth-dependent classes, no `border-s`, no `ps-[13px]` steps).

```css
.docs-row {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: var(--docs-row-height);
  padding: 0 9px;
  border-radius: var(--docs-radius-row);
  color: var(--sidebar-foreground);
  text-align: start;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 100ms, color 100ms;
}
.docs-row:hover {
  background: color-mix(in oklab, var(--sidebar-accent) 70%, transparent);
  color: var(--foreground);
}
.docs-row[aria-current="page"] {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  font-weight: 500;
}
.docs-row:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}
.docs-row[data-state="open"] {
  color: var(--foreground);
}
.docs-row-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.docs-row-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.docs-row-badge {
  flex-shrink: 0;
  padding: 4px 7px;
  border-radius: 999px;
  background: var(--docs-brand-soft);
  color: var(--primary);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1;
}
.docs-row-chevron {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--muted-foreground);
  opacity: 0.8;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.docs-row[data-state="open"] .docs-row-chevron {
  transform: rotate(90deg);
}
[dir="rtl"] .docs-row-chevron {
  transform: scaleX(-1);
}
[dir="rtl"] .docs-row[data-state="open"] .docs-row-chevron {
  transform: rotate(90deg);
}
.docs-sub {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 1px 0 3px;
  margin-inline-start: 17px;
  padding-inline-start: 7px;
  border-inline-start: 1px solid var(--border);
}
```

`DocsSidebarRow.vue`:

- Render `item.icon` only when a new prop `depth` is `0` (pass `:depth="depth"` from `DocsSidebarItem`). Class `docs-row-icon`.
- Label: `<span class="docs-row-label">`. Add `:title="item.title"` on the row root in `DocsSidebarItem.vue` so a truncated title is readable on hover.
- Badge: replace the `Badge` component with `<span class="docs-row-badge">`.
- Chevron: `lucide:chevron-right`, class `docs-row-chevron`, `aria-hidden="true"`. It follows the badge (badge then chevron, both at the end). Remove the old `-rotate-90`, `group-data-*`, and `rtl:rotate-90` classes.

`DocsSidebarItem.vue`:

- Remove `data-active` everywhere. The only current marker is `aria-current="page"` (contracts section 5).
- The `CollapsibleContent` gets `class="docs-sub overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"` at every depth (the old `contentRailClass` goes away).
- Keep the Collapsible behavior: a parent with a path navigates and toggles; a parent without a path only toggles; the folder of the current page opens on load and on route change.

`DocsSidebar.vue`:

- The `useRevealActive(..., "[data-active='true']")` selector becomes `"[aria-current='page']"`.
- Replace the group markup with the anatomy in section 3.

### 5. Section switcher

**Tabs** (`DocsSidebarTabs.vue`, the default): a segmented control that never truncates. When the titles do not fit, the list scrolls horizontally.

```css
.docs-seg {
  display: flex;
  gap: 2px;
  padding: 3px;
  overflow-x: auto;
  scrollbar-width: none;
  background: var(--docs-frame);
  border: 1px solid var(--docs-frame-border);
  border-radius: calc(var(--radius) + 2px);
}
.docs-seg-item {
  flex: 1 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 30px;
  padding: 0 10px;
  border-radius: calc(var(--radius) - 1px);
  color: var(--muted-foreground);
  font-size: 0.84375rem;
  white-space: nowrap;
  text-decoration: none;
  transition: color 120ms, background-color 120ms;
}
.docs-seg-item:hover {
  color: var(--foreground);
}
.docs-seg-item[data-state="active"],
.docs-seg-item[aria-pressed="true"] {
  background: var(--docs-selected);
  box-shadow: var(--docs-selected-shadow);
  color: var(--foreground);
  font-weight: 500;
}
.docs-seg-item:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}
```

- `TabsList` gets `class="docs-seg"` and `:aria-label="t('docs.sections')"`. Remove its default shadcn classes for this use by passing the class and checking the rendered result (if the shadcn `TabsList` forces a background or height through its own classes, use `cn` override or render the Reka `TabsList` primitive directly; record which one you used).
- Each `TabsTrigger` gets `class="docs-seg-item"`. Remove `min-w-0 flex-1 basis-0` and the `truncate` span (render the title directly). Remove the `:title` attribute (nothing is truncated any more).
- Add the key `docs.sections` (`Sections` / `Bereiche`) to `layer/i18n/messages/global/docs.ts`.

**List** (`DocsSidebarList.vue`): each button becomes a `.docs-row` with `aria-pressed`; the pressed one uses the current style. Add to `docs-shell.css`:

```css
.docs-row[aria-pressed="true"] {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  font-weight: 500;
}
```

Keep `data-slot="docs-sidebar-list"`, the icon (these are top-level rows), and `aria-pressed`.

**Dropdown** (`DocsSidebarDropdown.vue`): the trigger becomes a row inside a frame. Trigger class:

```css
.docs-switcher-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  height: 40px;
  padding: 0 10px;
  background: var(--docs-frame);
  border: 1px solid var(--docs-frame-border);
  border-radius: calc(var(--radius) + 2px);
  color: var(--foreground);
  font-weight: 500;
  text-align: start;
}
.docs-switcher-trigger:hover {
  border-color: var(--docs-border-strong);
}
.docs-switcher-trigger:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

The menu (`DropdownMenuContent` for this switcher only, via its `class` prop): `background: var(--docs-frame); border: 1px solid var(--docs-frame-border); border-radius: var(--docs-radius-frame); padding: 4px; box-shadow: var(--docs-shadow-pop)`. Items: `padding: 7px 8px; border-radius: var(--docs-radius-row); font-size: 0.84375rem`, highlighted item `background: var(--muted)`. Put these in `docs-shell.css` as `.docs-menu` and `.docs-menu-item` (brief 03c reuses them). Keep `data-slot="docs-sidebar-dropdown"`, the check indicator, and the radio group.

### 6. Certification

In `scripts/certify-packed-fixtures.mjs`, change `a[href="${destination}"][aria-current="page"][data-active="true"]` to `a[href="${destination}"][aria-current="page"]`.

## Visible strings

Only `docs.sections`: English `Sections`, German `Bereiche` (the accessible name of the tab list).

## Done when

- At 1440 px in both schemes and both surfaces (set `theme.surface: "quiet"` in `docs/app/app.config.ts` locally for the quiet screenshots; do not commit it), the sidebar matches the prototype's standalone sidebar: 32 px rows at every depth, children in a 1 px line, one chip for the current page, no icons on child rows, sentence-case group labels, tabs showing "Documentation" and "Reference" in full.
- At 1920 px wide, the sidebar background touches the left viewport edge (add `--routes /docs/getting-started` and a manual 1920 px screenshot, or temporarily add 1920 to `widths` in your local copy of the script; do not commit that change).
- Keyboard: Tab reaches the section tabs, then every row in order; Enter on a parent row toggles it; focus rings are visible.
- `git grep -n "data-active" -- layer/app/features scripts` returns nothing.
- `pnpm verify` and `pnpm release:verify` pass; `shots.mjs` exits 0.

## Commits

1. `feat(sidebar): rebuild rows on one 32px row style`
2. `feat(sidebar): segmented section tabs that never truncate`
3. `fix(sidebar): let the sidebar background reach the viewport edge`
