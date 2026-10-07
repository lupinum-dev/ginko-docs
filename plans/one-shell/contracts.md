# Contracts

This file is the single source of truth for the public contract of the one-shell refactor. Briefs point here instead of repeating values. When a brief and this file disagree, stop and report.

Paths are relative to the repository root. "Layer" means `layer/`.

## 1. Brand variables (set by the host)

The shell reads these shadcn variables. A host sets them on `:root` and `.dark`. Lib docs sites get them from `theme.preset`, `theme.neutral`, and `theme.primary` (existing behavior in `layer/app/assets/css/tailwind.css`, `theme-palettes.css`, `theme-presets.css`).

`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, `--font-body`, `--font-heading`, `--font-mono`.

Optional brand variables with fallbacks in the tokens below: `--info`, `--success`, `--warning`.

Naming trap: in the prototype, `--accent` means the brand color. In the layer, `--accent` is the shadcn hover background. Prototype `--accent` maps to layer `--primary`; prototype `--accent-soft` maps to `--docs-brand-soft`.

## 2. Docs tokens (derived)

Brief 02 creates `layer/app/assets/css/docs-tokens.css` with exactly this content and imports it in `tailwind.css` right after `theme-presets.css`. It is also imported by the component kit and, later, the section module. Every declaration uses `:where()` so any host rule on `:root` or `.dark` wins regardless of load order.

```css
/* Ginko Docs derived tokens. Hosts set brand variables (contracts.md, section 1);
   everything here derives from them and can be overridden. This is the only
   docs stylesheet that may contain color literals. */

:where(:root) {
  /* Geometry, derived from the brand radius (10px by default). */
  --docs-radius-row: calc(var(--radius) - 2px); /* 8px: rows, chips, menu items */
  --docs-radius-panel: var(--radius); /* 10px: panels, inputs, search button */
  --docs-radius-frame: calc(var(--radius) + 4px); /* 14px: frames, callouts, cards */
  --docs-radius-dialog: calc(var(--radius) + 8px); /* 18px: search dialog, mobile sheet, inset stage */
  --docs-row-height: 2rem;

  /* Ground behind the inset stage. */
  --docs-ground: color-mix(in oklab, var(--foreground) 4%, var(--background));

  /* Always-on neutrals. */
  --docs-border-strong: color-mix(in oklab, var(--foreground) 16%, var(--background));
  --docs-chip: var(--background);
  --docs-brand-soft: color-mix(in oklab, var(--primary) 12%, var(--background));
  --docs-shadow-chip: 0 1px 2px oklch(0 0 0 / 0.06), 0 0 0 1px oklch(0 0 0 / 0.04);
  --docs-shadow-pop: 0 12px 32px oklch(0 0 0 / 0.14), 0 2px 6px oklch(0 0 0 / 0.08);
  --docs-overlay: oklch(0.15 0.005 286 / 0.36); /* behind dialogs and sheets, both schemes */

  /* Sidebar, with the standard shadcn names. */
  --sidebar: color-mix(in oklab, var(--foreground) 2%, var(--background));
  --sidebar-foreground: color-mix(in oklab, var(--foreground) 72%, var(--background));
  --sidebar-accent: color-mix(in oklab, var(--foreground) 6%, var(--background));
  --sidebar-accent-foreground: var(--foreground);
  --sidebar-border: var(--border);

  /* Callout tones. Text uses --docs-tone-ink (section 3). */
  --docs-tone-note: var(--muted-foreground);
  --docs-tone-info: var(--info, oklch(0.55 0.18 255));
  --docs-tone-success: var(--success, oklch(0.55 0.14 162));
  --docs-tone-warning: var(--warning, oklch(0.66 0.16 82));
  --docs-tone-error: var(--destructive);
  --docs-tone-idea: oklch(0.55 0.19 295);
}

:where(.dark) {
  --docs-ground: color-mix(in oklab, black 40%, var(--background));
  --docs-chip: color-mix(in oklab, var(--foreground) 10%, var(--background));
  --docs-shadow-chip: 0 1px 2px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(1 0 0 / 0.06);
  --docs-shadow-pop: 0 16px 40px oklch(0 0 0 / 0.6), 0 2px 8px oklch(0 0 0 / 0.4);
  --docs-overlay: oklch(0 0 0 / 0.6);
  --docs-tone-idea: oklch(0.76 0.13 295);
}

/* Surface: framed (default). Only surface-dependent tokens live here. */
:where(:root, [data-docs-surface="framed"]) {
  --docs-frame: color-mix(in oklab, var(--foreground) 4%, var(--background));
  --docs-frame-border: color-mix(in oklab, var(--foreground) 7%, var(--background));
  --docs-frame-pad: 4px;
  --docs-panel: var(--background);
  --docs-panel-border: var(--border);
  --docs-panel-radius: var(--docs-radius-panel);
  --docs-head-rule: 0px;
  --docs-selected: var(--docs-chip);
  --docs-selected-shadow: var(--docs-shadow-chip);
  --docs-sidebar-group: var(--background);
  --docs-sidebar-group-border: var(--sidebar-border);
  --docs-sidebar-group-pad: 4px;
  --docs-tile: var(--docs-frame); /* icon tiles, step markers, muted layout surface */
  --docs-tile-border: var(--docs-frame-border);
  --docs-tone-fill: 8%;
  --docs-callout-inset: 10px;
  --docs-callout-py: 11px;
  --docs-callout-px: 16px;
}

/* Surface: quiet. Same token names, quieter values. Declared after framed. */
:where([data-docs-surface="quiet"]) {
  --docs-frame: var(--background);
  --docs-frame-border: var(--border);
  --docs-frame-pad: 0px;
  --docs-panel: var(--background);
  --docs-panel-border: transparent;
  --docs-panel-radius: 0px;
  --docs-head-rule: 1px;
  --docs-selected: var(--muted);
  --docs-selected-shadow: none;
  --docs-sidebar-group: transparent;
  --docs-sidebar-group-border: transparent;
  --docs-sidebar-group-pad: 0px;
  --docs-tile: var(--muted);
  --docs-tile-border: var(--border);
  --docs-tone-fill: 0%;
  --docs-callout-inset: 0px;
  --docs-callout-py: 1px;
  --docs-callout-px: 0px;
}
```

Rules for using the tokens:

- Component and shell CSS reads only brand variables (section 1) and `--docs-*` / `--sidebar*` tokens. No literals (README rule 6).
- A frame is `background: var(--docs-frame); border: 1px solid var(--docs-frame-border); border-radius: var(--docs-radius-frame); padding: var(--docs-frame-pad); overflow: hidden`.
- A panel is `background: var(--docs-panel); border: 1px solid var(--docs-panel-border); border-radius: var(--docs-panel-radius)`.
- A head row is `display: flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 8px 0 10px; font-size: 13px; color: var(--muted-foreground); border-bottom: var(--docs-head-rule) solid var(--border)`. A foot row is the same with `min-height: 34px` and `border-top` instead of `border-bottom`.
- The selected chip (active tab, section tab, selected code tree file) is `background: var(--docs-selected); box-shadow: var(--docs-selected-shadow); color: var(--foreground); font-weight: 500`. The current sidebar page is not a chip: it uses `background: var(--sidebar-accent); color: var(--sidebar-accent-foreground); font-weight: 500` (brief 03a).
- Where brand variables are re-scoped (the dark code theme, `html[data-code-blocks="dark"]`), the derived tokens are re-declared in the same scope in `docs-tokens.css` (brief 04b has the CSS), because custom properties resolve where they are declared.
- Quiet never needs its own selector in component CSS. If a component seems to need `[data-docs-surface="quiet"] .x`, add a token to both surface blocks above instead (and record it in the pull request).

## 3. Surface and placement

| Setting | Values | Default | Where it lands |
| --- | --- | --- | --- |
| `theme.surface` (app config) | `"framed"`, `"quiet"` | `"framed"` | `data-docs-surface` on `<html>`, set by `layer/app/plugins/ginko-docs-theme.ts` |
| `theme.shell` (app config) | `"standalone"`, `"inset"` | `"standalone"` | `data-docs-shell` on the docs layout root |
| Section module (05b) | `surface`, and placement `section` | `"framed"` | `data-docs-surface` and `data-docs-shell="section"` on the section root |

`data-docs-surface` can also be set on any element to scope a surface, for example a framed demo inside a quiet page. The tokens inherit, so no extra CSS is needed.

Callout ink: every tone color used as text is `--docs-tone-ink: color-mix(in oklab, var(--docs-tone) 70%, var(--foreground))`. If axe reports a contrast failure for a tone title, lower 70% in steps of 5 (down to 55%) and record the value in the pull request.

## 4. Layout variables

Public, documented in `docs/content/*/5.customization/3.theming-and-overrides.md` (brief 01), covered by a test (brief 01). Defaults live in `layer/app/assets/css/tailwind.css` `:root`.

| Variable | Default | Writer | Meaning |
| --- | --- | --- | --- |
| `--site-header-height` | `3.5rem` | Host or layer header | Sticky offset for the sidebar, TOC, and anchors |
| `--site-banner-height` | `0px` | `SiteBanner` only | Height of the visible banner |
| `--docs-sidebar-width-expanded` | `17rem` (272 px; today `268px`, brief 03a changes it) | Host may override | Sidebar width |
| `--docs-sidebar-width` | `var(--docs-sidebar-width-expanded)` | Layer | Current sidebar width |
| `--docs-toc-width` | `14.5rem` (232 px; today `16rem`, brief 03b changes it) | Host may override | TOC column width |
| `--docs-stage-width` | `72.5rem` (1160 px), new in brief 03b | Host may override | Max width of article plus TOC, centered in the stage |
| `--docs-article-width` | `45rem` (720 px), new in brief 03b | Host may override | Reading column width |
| `--content-scroll-margin` | existing formula | Layer | Anchor scroll offset |

## 5. Styling hooks (`data-docs-*` and ARIA)

Added in brief 01, kept stable afterwards. Class names, nesting, and label text are not part of the contract.

| Hook | Element | Values | Owner |
| --- | --- | --- | --- |
| `data-docs-shell` | Root of the docs layout (`layer/app/layouts/docs.vue`) | `standalone` \| `inset` (\| `section` in 05b) | layout |
| `data-docs-surface` | `<html>` (and any element that scopes a surface) | `framed` \| `quiet` | theme plugin |
| `data-docs-sidebar` | The sidebar `<aside>` | `desktop` \| `drawer` | `DocsSidebar.vue` (replaces `data-variant`) |
| `data-docs-article` | The `<main id="main-content">` of a docs page | (present) | `DocsPageContent.vue` |
| `data-docs-toc` | The desktop TOC `<aside>` and the mobile TOC root | `desktop` \| `mobile` | `DocsPageContent.vue`, `DocsMobileToc.vue` |
| `data-docs-breadcrumb` | The breadcrumb `<nav>` | (present) | `DocsBreadcrumb.vue` |
| `data-docs-pager` | The previous/next `<nav>` | (present) | `DocsPageNav.vue` |
| `data-docs-active` | Each active TOC link | (present) | `DocsToc.vue` (replaces `data-toc-active`) |
| `aria-current="page"` | The current sidebar link | `page` | `DocsSidebarItem.vue` (the only marker; `data-active` goes away in 03a) |
| `data-slot="docs-sidebar-tabs"`, `"docs-sidebar-dropdown"`, `"docs-sidebar-list"`, `"docs-sidebar-group-title"` | Section switchers and group titles | existing | kept: the release certification uses them |

## 6. App config changes

`layer/shared/types/app-config.ts` (the public contract) and `layer/app/app.config.ts` (defaults). Brief 02 and 03b apply them.

```ts
// Removed (brief 02):
//   export type GinkoDocsProseAppearance = "quiet" | "tint";
//   export type GinkoDocsProseFamily = ...;
//   export interface GinkoDocsProseConfig { ... }
//   GinkoDocsAppConfig.prose

// Added (brief 02):
export type GinkoDocsSurface = "framed" | "quiet";

// Added (brief 03b):
export type GinkoDocsShell = "standalone" | "inset";

export interface GinkoDocsAppConfig {
  theme: {
    preset?: GinkoDocsThemePreset;
    neutral: GinkoDocsNeutralPalette;
    primary: GinkoDocsPrimaryPalette;
    codeBlocks: GinkoDocsCodeBlockTheme;
    /** framed boxes objects and tints callouts; quiet uses rules and lines only. */
    surface: GinkoDocsSurface;
    /** standalone fills the page; inset shows the article as a card on a tinted ground. */
    shell: GinkoDocsShell;
  };
  // ...rest unchanged
}
```

Defaults: `theme.surface: "framed"`, `theme.shell: "standalone"`.

## 7. Public composables

Brief 01 adds them in `layer/app/composables/` (auto-imported in every layer consumer). Brief 05b also exports them from `@lupinum/ginko-docs/section`. Documented in `7.reference/2.app-config.md` and its German twin (brief 01).

```ts
// layer/app/composables/useDocsSearch.ts
export function useDocsSearch(): {
  /** True while the search dialog is open. */
  isOpen: Readonly<Ref<boolean>>;
  /** Opens the one search dialog, optionally with a query. */
  open: (query?: string) => void;
  close: () => void;
};

// layer/app/composables/useDocsNavigation.ts (moved from
// layer/app/features/docs/composables/useDocsNavigation.ts; one implementation)
export async function useDocsNavigation(): Promise<{
  /** Top-level sections (tabs in the sidebar switcher). */
  sections: ComputedRef<DocsNavigationSection[]>;
  /** All navigation roots for the current locale. */
  tree: ComputedRef<DocsNavigationItem[]>;
  /** The navigation item of the current route, if any. */
  current: ComputedRef<DocsNavigationItem | undefined>;
  /** From the root to the current item (the former `trail`). */
  breadcrumbs: ComputedRef<DocsNavigationItem[]>;
  /** The localized docs root path, e.g. "/docs" or "/de/dokumentation". */
  rootPath: ComputedRef<string>;
}>;
```

`DocsNavigationItem` and `DocsNavigationSection` stay defined in `layer/app/features/docs/docs-navigation.ts`. Brief 05b exports them from the section entry.

Header links for a host header come from the public app config (`useAppConfig().ginkoDocs.nav.links`); no composable is needed for them.

## 8. New labels

| Key | English | German | Brief |
| --- | --- | --- | --- |
| `callout.note` | Note | Hinweis | 04a |
| `callout.info` | Info | Info | 04a |
| `callout.success` | Success | Erfolg | 04a |
| `callout.warning` | Warning | Warnung | 04a |
| `callout.error` | Error | Fehler | 04a |
| `callout.idea` | Idea | Idee | 04a |
| `docs.sections` | Sections | Bereiche | 03a |
| `api.required` | Required | Erforderlich | 04d |
| `api.deprecated` | Deprecated | Veraltet | 04d |
| `api.default` | Default | Standard | 04d |
| `api.since` | Since {version} | Seit {version} | 04d |

Components that ship in the component kit read strings with `useDocsText()` (host i18n when installed, English otherwise); shell components may use `useI18n()`. Put `callout.*` in a new `layer/i18n/messages/global/callout.ts` and `api.*` in a new `layer/i18n/messages/global/api.ts`, both registered in `layer/i18n/messages/global/index.ts` and following the shape of `docs.ts`. Existing keys (`docs.toc`, `docs.previous`, `docs.next`, `docs.backToTop`, `docs.editPage`, `docs.reportIssue`, `docs.mobileToc`, `docs.lastUpdated`) are reused as they are.

## 9. Certification selectors

`scripts/certify-packed-fixtures.mjs` drives a browser against built fixtures. Any brief that changes these must update the script in the same commit and run `pnpm release:verify`:

`aside[data-variant="desktop"]` (becomes `aside[data-docs-sidebar="desktop"]` in brief 01), `a[...][aria-current="page"][data-active="true"]` (drops `[data-active="true"]` in brief 03a), `[data-slot="docs-sidebar-<switcher>"]`, `[data-slot="docs-sidebar-list"] button[aria-pressed="false"]`, `[data-slot="docs-sidebar-group-title"]`, `header [role="switch"]`, `header a[target="_blank"][aria-label]`, `a[lang="de"]`, and the role queries for the search button, menu button, language button, mobile navigation, and dialog.
