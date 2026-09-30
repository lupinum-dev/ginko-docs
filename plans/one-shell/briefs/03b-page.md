# Brief 03b: page, TOC, stage, and placements

Goal: the article area matches the prototype. The stage centers the article and the TOC; the TOC shows when the stage has room (not at a viewport breakpoint); the page head, TOC, mobile bar, and page end use the new values; `theme.shell: "inset"` shows the stage as a card on a tinted ground.

Depends on: 03a. Release check: **yes** (the docs layout and the public config change).

Prototype reference: `.stage*`, `.article*`, `.crumbs`, `.page-head`, `h1.title`, `.lede`, `.split*`, `.toc*`, `.pager`, `.feedback`, the `[data-layout="inset"]` rules, and the media queries at the end (prototype lines 222 to 275, 595 to 632, 675 to 704). Compare "Standalone" and "Inset" in the prototype dock.

## Read first

- [contracts.md](../contracts.md) sections 2, 3, 4, 5, 6
- `layer/app/layouts/docs.vue`
- `layer/app/features/docs/components/DocsPageContent.vue`, `DocsToc.vue`, `DocsMobileToc.vue`, `DocsBreadcrumb.vue`, `DocsPageNav.vue`, `DocsContributeLinks.vue`
- `layer/app/components/content/PageMarkdownCopy.vue`, `Feedback.vue`
- `layer/app/assets/css/tailwind.css` (the `.docs-sidebar-shell` and `.docs-toc-shell` media rules at the top, and `:root` layout variables)
- `layer/shared/types/app-config.ts`, `layer/app/app.config.ts`

## Scope

Allowed: the files above and `layer/app/assets/css/docs-shell.css`; docs pages that document the app config (`7.reference/2.app-config.md`, `7.referenz/2.app-config.md`) and the layout variables (`5.customization/3.theming-and-overrides.md`, `5.anpassung/3.design-und-overrides.md`).

Forbidden: the header, search dialog, and mobile sheet (brief 03c); prose typography inside the article (brief 04); page data loading, SEO, and scrollspy logic.

## Changes

### 1. Config

Add `GinkoDocsShell` and `theme.shell` as in [contracts.md](../contracts.md) section 6, default `"standalone"`. In `layouts/docs.vue`, the root gets `:data-docs-shell="shell"` where `shell` is `useAppConfig().ginkoDocs.theme.shell ?? "standalone"`. Document it in both app-config pages next to `theme.surface`:

- English: `` `theme.shell`: `"standalone"` (default) fills the page with the sidebar at the edge. `"inset"` shows the article as a card on a tinted background. ``
- German: `` `theme.shell`: `"standalone"` (Standard) füllt die Seite, die Seitenleiste liegt am Rand. `"inset"` zeigt den Artikel als Karte auf einem getönten Hintergrund. ``

### 2. Layout variables

In `tailwind.css` `:root`: `--docs-toc-width: 14.5rem;`, and add `--docs-stage-width: 72.5rem;` and `--docs-article-width: 45rem;`. Delete the `.docs-sidebar-shell` / `.docs-toc-shell` `display` rules and their media queries at the top of `tailwind.css` (container queries below replace them). Update the layout variable table in the theming docs page (brief 01) with the two new variables.

### 3. Shell and stage

Structure after this brief:

```
div[data-docs-shell]  .docs-shell                       (layouts/docs.vue root; container "docs-shell")
  SiteSkipLink, SiteBanner, SiteHeader
  div.docs-shell-body                                   (flex row)
    div.docs-sidebar-slot                               (the sticky sidebar wrapper, was .docs-sidebar-shell)
      DocsSidebar
    <slot/>  → DocsPageContent renders:
      div.docs-stage                                    (container "docs-stage")
        DocsMobileToc  [data-docs-toc="mobile"]  .docs-mobile-bar
        div.docs-stage-inner
          main#main-content[data-docs-article]  .docs-article
            article.docs-article-inner
          aside[data-docs-toc="desktop"]  .docs-toc
  SiteFooter, SiteInteractionLayer
```

Add to `docs-shell.css`:

```css
.docs-shell {
  container: docs-shell / inline-size;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: var(--background);
  color: var(--foreground);
}
.docs-shell-body {
  display: flex;
  flex: 1;
  min-width: 0;
}
.docs-sidebar-slot {
  display: none;
  position: sticky;
  top: calc(var(--site-banner-height, 0px) + var(--site-header-height));
  z-index: 20;
  width: var(--docs-sidebar-width);
  height: calc(100dvh - var(--site-header-height) - var(--site-banner-height, 0px));
  flex-shrink: 0;
}
@container docs-shell (min-width: 54rem) {
  .docs-sidebar-slot {
    display: block;
  }
}
.docs-stage {
  container: docs-stage / inline-size;
  flex: 1;
  min-width: 0;
}
.docs-stage-inner {
  display: flex;
  align-items: flex-start;
  max-width: var(--docs-stage-width);
  margin-inline: auto;
}
.docs-article {
  flex: 1;
  min-width: 0;
  padding: 40px 48px 56px;
}
.docs-article-inner {
  max-width: var(--docs-article-width);
  margin-inline: auto;
}
@container docs-stage (max-width: 40rem) {
  .docs-article {
    padding: 28px 20px 48px;
  }
}

/* Inset placement: the stage is a card on a tinted ground. */
.docs-shell[data-docs-shell="inset"] {
  background: var(--docs-ground);
}
.docs-shell[data-docs-shell="inset"] .docs-sidebar {
  background: transparent;
  border-inline-end: 0;
}
.docs-shell[data-docs-shell="inset"] .docs-stage {
  margin: 0 8px 8px 0;
  min-height: calc(100dvh - var(--site-header-height) - 8px);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--docs-radius-dialog);
  box-shadow: var(--docs-shadow-chip);
}
@container docs-shell (max-width: 54rem) {
  .docs-shell[data-docs-shell="inset"] .docs-stage {
    margin: 0 6px 6px;
  }
}
```

Remove the Tailwind classes these replace in `layouts/docs.vue` and `DocsPageContent.vue` (`mx-auto w-full max-w-[72ch] px-4 py-8 md:px-6 xl:py-14`, the TOC aside's `sticky top-[...] h-[...] w-[var(--docs-toc-width)] pt-10 pr-4 pb-6`, `xl:flex-row`, and similar).

### 4. Page head

In `DocsPageContent.vue`:

```css
.docs-page-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.docs-page-head > :first-child {
  flex: 1;
  min-width: 0;
}
@container docs-stage (max-width: 54rem) {
  .docs-page-head {
    flex-direction: column;
    gap: 14px;
  }
}
.docs-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.025em;
  text-wrap: balance;
  color: var(--foreground);
}
@container docs-stage (max-width: 54rem) {
  .docs-title {
    font-size: 1.625rem;
  }
}
.docs-lede {
  max-width: 60ch;
  margin: 10px 0 0;
  font-size: 1.03125rem;
  line-height: 1.55;
  color: var(--muted-foreground);
  text-wrap: pretty;
}
.docs-head-rule {
  height: 1px;
  margin: 24px 0 28px;
  border: 0;
  background: var(--border);
}
```

- The `<h1>` gets `docs-title`; the description `<p>` gets `docs-lede`; the `Separator` becomes `<hr class="docs-head-rule">`.
- `DocsBreadcrumb.vue`: `font-size: 0.8125rem; gap: 4px; margin-bottom: 10px; color: var(--muted-foreground)`; chevrons 13 px with `opacity: 0.6` and `color: currentColor` (not `text-border`). Links hover to `var(--foreground)`. Add these as `.docs-breadcrumb` rules.

Page actions (`PageMarkdownCopy.vue`), a split button:

```css
.docs-split {
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--docs-radius-panel);
}
.docs-split > button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  font-size: 0.8125rem;
  color: var(--foreground);
}
.docs-split > button:hover {
  background: var(--muted);
}
.docs-split > button + button {
  padding: 0 8px;
  border-inline-start: 1px solid var(--border);
}
.docs-split > button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}
```

Replace the two `Button` components with plain `<button type="button">` elements inside `<div class="docs-split">` (keep every handler, label, `aria-label`, and icon; icons 14 px). The dropdown menu content uses `.docs-menu` / `.docs-menu-item` from brief 03a, width `272px`, `align="end"`.

### 5. Desktop TOC

```css
.docs-toc {
  display: none;
  position: sticky;
  top: calc(var(--site-banner-height, 0px) + var(--site-header-height) + 8px);
  width: var(--docs-toc-width);
  max-height: calc(100dvh - var(--site-header-height) - var(--site-banner-height, 0px) - 16px);
  flex-shrink: 0;
  flex-direction: column;
  overflow-y: auto;
  padding: 40px 20px 24px 8px;
  font-size: 0.8125rem;
}
@container docs-stage (min-width: 57.5rem) {
  .docs-toc {
    display: flex;
  }
}
.docs-toc-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 10px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-foreground);
}
.docs-toc-list {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  border-inline-start: 1px solid var(--border);
}
.docs-toc-link {
  display: block;
  padding: 5px 0;
  padding-inline-start: 13px;
  line-height: 1.4;
  color: var(--muted-foreground);
  text-decoration: none;
  transition: color 120ms;
}
.docs-toc-link[data-depth="3"] {
  padding-inline-start: 25px;
}
.docs-toc-link[data-depth="4"] {
  padding-inline-start: 37px;
}
.docs-toc-link:hover {
  color: var(--foreground);
}
.docs-toc-link[data-docs-active] {
  color: var(--foreground);
  font-weight: 500;
}
.docs-toc-link:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
  border-radius: 4px;
}
.docs-toc-thumb {
  position: absolute;
  inset-inline-start: -1px;
  width: 2px;
  border-radius: 2px;
  background: var(--primary);
  pointer-events: none;
  transition:
    top 220ms cubic-bezier(0.16, 1, 0.3, 1),
    height 220ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 120ms;
}
.docs-toc-foot {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.docs-toc-foot :is(a, button) {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 0;
  font-size: 0.8125rem;
  color: var(--muted-foreground);
  text-decoration: none;
}
.docs-toc-foot :is(a, button):hover {
  color: var(--foreground);
}
.docs-toc-foot svg {
  width: 14px;
  height: 14px;
}
```

`DocsToc.vue`:

- Title: `<p class="docs-toc-label">` with `lucide:list` (14 px) and `t("docs.toc")`. Sentence case: remove `uppercase tracking-wider`. Keep `showTitle`.
- Replace the list wrapper `<div class="relative border-l border-border pl-3">` with `<div style="position: relative">` holding the `<ul class="docs-toc-list">` and, as a sibling after it, `<span aria-hidden="true" class="docs-toc-thumb" :style="indicatorStyle" />` (a `span`, not an `li`, so the list only contains entries). Keep measuring `top` and `height` the same way.
- Each link: `class="docs-toc-link"`, `:data-depth="item.depth ?? 2"`, `data-docs-active` when active. **Remove `truncate` and the `title` attribute** (entries wrap; long questions stay readable).
- Keep `measureIndicator`, `scrollToHeading`, and the resize listener.

In `DocsPageContent.vue`, the TOC foot is `<div class="docs-toc-foot">` directly after `DocsToc` (remove `mt-auto`, `border-border/70`, `pt-5`, `gap-2.5`). It holds `DocsContributeLinks variant="rail"` and the back-to-top button. In `DocsContributeLinks.vue`, the `rail` variant renders its links without its own classes (the foot styles them): remove `min-h-9`, `font-medium`, and `text-sm` for `rail`.

### 6. Mobile bar

`DocsMobileToc.vue` keeps its behavior (a sticky bar with the sidebar drawer on the left and the TOC sheet on the right). New look:

```css
.docs-mobile-bar {
  position: sticky;
  top: calc(var(--site-banner-height, 0px) + var(--site-header-height));
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  background: color-mix(in oklab, var(--background) 90%, transparent);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--border);
}
@container docs-stage (min-width: 57.5rem) {
  .docs-mobile-bar {
    display: none;
  }
}
.docs-mobile-bar-drawer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 32px;
  padding: 0 8px;
  border-radius: var(--docs-radius-row);
  font-size: 0.84375rem;
  font-weight: 500;
  color: var(--foreground);
}
@container docs-shell (min-width: 54rem) {
  .docs-mobile-bar-drawer {
    visibility: hidden;
  }
}
.docs-mobile-bar-toc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--docs-radius-row);
  font-size: 0.78125rem;
  font-weight: 500;
  color: var(--muted-foreground);
}
:is(.docs-mobile-bar-drawer, .docs-mobile-bar-toc):hover {
  background: var(--muted);
  color: var(--foreground);
}
:is(.docs-mobile-bar-drawer, .docs-mobile-bar-toc):focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}
```

Replace the root's `xl:hidden` and the other Tailwind classes with `docs-mobile-bar`, the left trigger with `docs-mobile-bar-drawer`, the right trigger with `docs-mobile-bar-toc`. The drawer trigger is hidden (not removed) while the desktop sidebar shows, so the TOC trigger keeps its place. The bottom sheet's inner `DocsToc` gets the TOC styles above automatically. The sheet itself is restyled in brief 03c.

### 7. Page end

In `DocsPageContent.vue`, the `<footer>` order becomes: pager, then one row with feedback, last-updated, and (only while the desktop TOC is hidden) the contribute links.

```css
.docs-page-end {
  margin-top: 56px;
}
.docs-pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@container docs-stage (max-width: 32rem) {
  .docs-pager {
    grid-template-columns: 1fr;
  }
}
.docs-pager-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--docs-radius-frame);
  font-size: 0.8125rem;
  color: var(--muted-foreground);
  text-decoration: none;
  transition: border-color 120ms, background-color 120ms;
}
.docs-pager-link:hover {
  border-color: var(--docs-border-strong);
  background: var(--muted);
}
.docs-pager-link:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
.docs-pager-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.90625rem;
  font-weight: 500;
  color: var(--foreground);
}
.docs-pager-link[data-dir="next"] {
  grid-column: 2;
  text-align: end;
}
.docs-pager-link[data-dir="next"] .docs-pager-title {
  justify-content: flex-end;
}
@container docs-stage (max-width: 32rem) {
  .docs-pager-link[data-dir="next"] {
    grid-column: 1;
  }
}
.docs-page-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 0.84375rem;
  color: var(--muted-foreground);
}
.docs-page-meta > :last-child {
  margin-inline-start: auto;
}
@container docs-stage (min-width: 57.5rem) {
  .docs-page-meta .docs-contribute-inline {
    display: none;
  }
}
```

- `DocsPageNav.vue`: root `<nav data-docs-pager class="docs-pager">`; each link `docs-pager-link` with `data-dir="prev"` or `"next"`; the label is the existing `t("docs.previous")` / `t("docs.next")` text; the title is `<span class="docs-pager-title">` with `lucide:arrow-left` before (previous) or `lucide:arrow-right` after (next), 14 px. Remove `min-h-20`, `rounded-xl`, `bg-card`, `px-5 py-4`.
- `Feedback.vue`: the question keeps its text; its style becomes `font-size: 0.84375rem; font-weight: 500; color: var(--foreground)`. The Yes/No buttons become a small segmented control: a `div.docs-seg` with two `button.docs-seg-item` (height 28 px via an extra class `docs-seg-item--sm { height: 28px; padding: 0 12px; }`), no selected state before a click. Keep the thanks message and issue link logic.
- Last updated: `<p>` with the existing `t("docs.lastUpdated")` text, 13 px, muted.
- `DocsContributeLinks` inline variant gets the extra class `docs-contribute-inline`.

## Visible strings

No new strings. Existing keys only.

## Done when

- At 1440 px: the article column is 720 px wide (measure `.docs-article-inner` in the browser), centered between sidebar and TOC; the TOC shows, wraps long entries, and its active line moves with scrolling.
- The TOC shows when the stage is at least 57.5rem (920 px) wide: with the 272 px sidebar that is a viewport of 1192 px or more. At 1180 px the TOC hides and the mobile bar shows only the TOC button; at 860 px and below the sidebar hides and the bar shows both buttons.
- Inset: with `theme.shell: "inset"` set locally (do not commit), the stage is a rounded card with an 8 px gap to the right and bottom edge, the sidebar has no background or border, and the ground is tinted, in both schemes.
- Standalone and inset screenshots at 375 and 1440, both schemes, in the pull request, next to the prototype at the same widths.
- `pnpm verify` and `pnpm release:verify` pass; `shots.mjs` exits 0.

## Commits

1. `feat(shell): center the stage and show the TOC by available space`
2. `feat(shell): restyle page head, TOC, and page end`
3. `feat(shell): add theme.shell with the inset placement`
