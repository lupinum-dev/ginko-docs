# Brief 02: token contract and surface setting

Goal: the derived docs tokens exist, `theme.surface` replaces `prose.appearance` and every per-component `appearance` prop, unused landing tokens leave the core theme, and a test stops color literals in shell and component code. Almost no visual change: this brief only moves the switch; the components get their new look in briefs 03 and 04.

Depends on: 01. Release check: **yes** (`pnpm release:verify`), because the public config and the component policy change.

## Read first

- [contracts.md](../contracts.md) sections 1, 2, 3, 6
- `layer/app/assets/css/tailwind.css`, `theme-presets.css`, `component-kit.css` (lines 140 to 420 use `var(--x, fallback)`)
- `layer/shared/types/app-config.ts`, `layer/app/app.config.ts`
- `layer/app/plugins/ginko-docs-theme.ts`
- `layer/app/composables/useProseAppearance.ts` and `useProseAppearance.test.ts`
- `layer/tags.ts` (the `appearance` constant and every `...appearance`) and `layer/authoring.ts` (`info.props.appearance`)
- `layer/component-kit.ts`, `layer/nuxt.config.ts` (CSS list)
- Every file from `git grep -l "appearance" -- layer docs/content`

## Scope

Allowed: the files above; `layer/app/assets/css/docs-tokens.css` (new); `layer/app/assets/css/landing-tokens.css` (new); `layer/app/pages/index.vue` (only if a token reference must change); `layer/component-kit.test.ts` (it asserts the kit's stylesheet list); `layer/app/assets/css/css-contract.test.ts` (new); every `layer/app/components/**/*.vue` that uses `useProseAppearance` or declares an `appearance` prop; `layer/app/features/search/components/SiteCommandCenter.vue`, `SiteSearchPageHighlight.vue`; generated `layer/authoring.generated.ts` (through `pnpm build:authoring` only); `docs/content/**` pages that mention `appearance` or `prose.appearance`.

Forbidden: changing component CSS rules other than the replacements listed below; changing component markup other than the `appearance` attributes and props.

## Changes

### 1. Tokens

1. Create `layer/app/assets/css/docs-tokens.css` with exactly the CSS in [contracts.md](../contracts.md) section 2.
2. In `tailwind.css`, add `@import "./docs-tokens.css";` directly after `@import "./theme-presets.css";`.
3. The component kit must also get the tokens: in `layer/component-kit.ts`, push `./app/assets/css/docs-tokens.css` into `nuxt.options.css` **before** `component-kit.css`. Update `layer/component-kit.test.ts`, which asserts the kit's stylesheet list, to expect both files in that order.

### 2. Surface setting

1. `app-config.ts`: remove `GinkoDocsProseAppearance`, `GinkoDocsProseFamily`, `GinkoDocsProseConfig`, and `prose` from `GinkoDocsAppConfig`. Add `GinkoDocsSurface` and `theme.surface` exactly as in [contracts.md](../contracts.md) section 6 (not `theme.shell`; that is brief 03b).
2. `app.config.ts`: remove `prose`; add `surface: "framed"` to `theme`.
3. `ginko-docs-theme.ts`: add `"data-docs-surface": theme.surface ?? "framed"` to `htmlAttrs`.
4. Temporary bridge (removed in brief 04e): rewrite `useProseAppearance.ts` so it takes **no arguments** and returns `computed<"quiet" | "tint">(() => config.theme.surface === "quiet" ? "quiet" : "tint")`. Keep the file name and the `data-appearance` attribute in the components, so today's CSS keeps working. Add this comment at the top: `// Bridge from theme.surface to the data-appearance CSS. Remove in brief 04e when no CSS reads data-appearance.`
5. Update `useProseAppearance.test.ts` to one table test: `surface: "framed"` gives `"tint"`, `"quiet"` gives `"quiet"`, missing surface gives `"tint"`. The wrong behavior it catches: a quiet site renders framed components.

### 3. Remove the `appearance` prop

1. In every Vue file under `layer/app/components/`: delete the `appearance?: "quiet" | "tint"` prop, delete `:appearance="appearance"` pass-throughs, and change `useProseAppearance("<family>", () => props.appearance)` to `useProseAppearance()`.
2. In `layer/tags.ts`: delete `const appearance = ...`, every `...appearance` spread, `appearance` inside `notice`, `code-group: block(appearance)` becomes `block()`, `collapse` and `timeline` the same, and `info`'s `appearance: choice(...)`.
3. In `layer/authoring.ts`, delete `appearance` from `authoring.info.props`.
4. Run `pnpm build:authoring` and commit the regenerated `layer/authoring.generated.ts`.

### 4. Docs content (English and German together)

1. Delete every `appearance="..."` attribute and every `{appearance="..."}` / `appearance: ...` component property in `docs/content/**`.
2. In the component reference pages (`8.components/1.mdc-components.md`, `8.komponenten/1.mdc-komponenten.md`), delete every `appearance` row from props tables and every sentence that explains `quiet` or `tint` per component.
3. In the showcase pages (`8.components/3.component-showcase.md`, `8.komponenten/3.komponenten-showcase.md`) and magazine pages: where the same component appears twice only to compare `quiet` and `tint`, keep the first example and delete the second one with its label or heading. Brief 04e adds a proper surface comparison.
4. In `7.reference/2.app-config.md` and `7.referenz/2.app-config.md`: replace the `prose` section with `theme.surface`:
   - English: `` `theme.surface`: `"framed"` (default) boxes code, tables, cards, and other objects and gives callouts a light tint. `"quiet"` uses rules and lines only, for sites that should feel like an article. ``
   - German: `` `theme.surface`: `"framed"` (Standard) setzt Code, Tabellen, Karten und andere Objekte in einen Rahmen und hinterlegt Hinweise leicht farbig. `"quiet"` nutzt nur Linien und Trennlinien, für Websites, die wie ein Artikel wirken sollen. ``
5. In `5.customization/3.theming-and-overrides.md` and `5.anpassung/3.design-und-overrides.md`: replace any mention of `prose.appearance` with `theme.surface`, and add a short section "Docs tokens" / "Docs-Tokens" that lists the token groups from [contracts.md](../contracts.md) section 2 (geometry, surfaces, sidebar, tones) and says that every token derives from the brand variables and can be overridden on `:root`.

### 5. Landing tokens

Evidence (checked on 2026-09-30): the landing page (`layer/app/pages/index.vue`, lines 79 to 82) reads eight hero tokens: `--hero-blue-dark`, `--hero-blue-muted`, `--hero-mint-muted`, `--hero-mint-text`, `--hero-yellow-dark`, `--hero-yellow-muted`, `--hero-coral-muted`, `--hero-coral-text`. Nothing reads the other `--hero-*` tokens, `--home-radius-*`, the `--color-hero-*` theme entries, or `--radius-{card,section,panel}` (Tailwind utilities).

1. Create `layer/app/assets/css/landing-tokens.css` with only the eight used tokens: their `:root` and `.dark` values from `tailwind.css`, and their `html[data-theme-preset="nuxt"]` values from `theme-presets.css`. Import it in `tailwind.css` after `docs-tokens.css`. (The section module in brief 05b does not load it: landing tokens belong to the default site.)
2. Delete from `tailwind.css` all other `--hero-*` and all `--home-radius-*` declarations in `:root` and `.dark`, every `--color-hero-*` line and the `--radius-card`, `--radius-section`, `--radius-panel` lines in `@theme inline`, and the eight moved declarations.
3. Delete the `--hero-*` declarations from `theme-presets.css` (the eight used ones now live in `landing-tokens.css`).
4. Run `git grep -nE -- "--hero-|--home-radius|--color-hero|--radius-(card|section|panel)\b" -- layer docs`. Expected hits: only `landing-tokens.css` and `index.vue` (the eight tokens). Anything else: stop and report.
5. Keep `--accent-{blue,mint,yellow,coral}*`, `--chart-*`, and `--agent-*` for now (the search highlight, the API panel, and the landing page use them). Replace only these two uses:
   - `SiteSearchPageHighlight.vue` and `SiteCommandCenter.vue`: `bg-accent-yellow` becomes `bg-[color-mix(in_oklab,var(--docs-tone-warning)_30%,transparent)]`, and `text-accent-yellow-foreground` becomes `text-foreground`.
   - `prose.css` line with `color-mix(in oklab, var(--chart-2) 22%, transparent)` and the `color: var(--chart-2)` rule: use `var(--docs-tone-success)`.

### 6. Color literal test

Create `layer/app/assets/css/css-contract.test.ts` (Vitest via `vite-plus/test`, like the other tests). It reads files from disk and fails with the file, line, and literal.

- CSS files checked: `layer/app/assets/css/prose.css`, `layer/app/assets/css/component-kit.css`.
- Vue files checked: every `.vue` under `layer/app/features/`, `layer/app/components/mdc/`, `layer/app/components/prose/`, `layer/app/components/content/`, `layer/app/components/site/`, and `layer/app/layouts/`.
- A literal is: a hex color (`#` plus 3, 4, 6, or 8 hex digits), `rgb(`, `rgba(`, `hsl(`, `hsla(`, `oklch(`, `oklab(`, the keywords `white` or `black` as a value, or a Tailwind palette utility (`bg-`, `text-`, `border-`, `ring-`, `fill-`, `stroke-`, `from-`, `to-`, `via-`, `outline-`, `decoration-`, `shadow-` followed by `black`, `white`, or a palette name such as `red`, `slate`, `zinc`, with or without a `-NNN` step).
- Not a literal: `white-space`, `transparent`, `currentColor`, `inherit`, and anything inside the fallback of `var(--name, fallback)`.
- Also check that `docs-tokens.css` defines every token listed in [contracts.md](../contracts.md) section 2 (parse the `--name:` declarations and compare with the list in the test).

Wrong behaviors it catches: a component hard-codes a color, so a host brand change does not restyle it; a token is renamed or deleted, so hosts that override it silently lose their change.

If the test finds literals in the checked files today, remove them by using tokens (same visual result) instead of adding exceptions. Known case: mask gradients such as `[mask-image:linear-gradient(to_bottom,transparent,white_12px,...)]` in `DocsSidebar.vue` only use the alpha channel, so replace `white` with `var(--foreground)`. If a literal cannot be replaced without a visual change, stop and report it.

## Done when

- `git grep -n "prose.appearance\|GinkoDocsProseAppearance\|appearance?: \"quiet\"" -- layer docs` returns nothing.
- The grep from section 5, step 4 shows only `landing-tokens.css` and `index.vue`, and the landing page looks unchanged (screenshot of `/` at 1440 light and dark before and after).
- A docs page's `<html>` has `data-docs-surface="framed"`; with `theme.surface: "quiet"` in `docs/app/app.config.ts` (try locally, do not commit) it has `data-docs-surface="quiet"` and components render their current quiet look.
- `pnpm verify` and `pnpm release:verify` pass.
- `shots.mjs` shows no visual change except the search highlight color (show it in the pull request with one screenshot of a search result).

## Commits

1. `feat(theme): add derived docs tokens`
2. `feat(theme)!: replace prose.appearance with theme.surface`
   Body: `BREAKING CHANGE: prose.appearance and the per-component appearance prop are removed. Use theme.surface ("framed" or "quiet").`
3. `docs(components): remove appearance from component docs`
4. `refactor(theme): move landing tokens out of the core theme`
5. `test(theme): forbid color literals in shell and component code`
