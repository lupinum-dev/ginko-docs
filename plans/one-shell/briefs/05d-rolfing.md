# Brief 05d: migrate rolfing

Goal: rolfing (its site checkout) uses the released section mode and has no selector into docs markup and no private import.

Depends on: 05c released to npm (a version the maintainer published). Other repository. Size: M.

This brief follows "Migration for rolfing" in `lupinum-website/changes-needed/ginko-docs-section-mode.md`. That section is the source; this file adds only the ginko-docs details from this refactor.

## Before starting

- rolfing has uncommitted work and local `file:` overrides in `pnpm-workspace.yaml` (pointing to local worktrees of ginko-docs and ginko-content). **Ask the maintainer first** whether to commit, stash, or wait. Do not touch uncommitted files without that answer.
- Read rolfing's `AGENTS.md`, `SITE_STANDARD.md`, and `DESIGN.md` if present, and follow its commands (`vp run verify`).

## ginko-docs details

| rolfing today | After |
| --- | --- |
| `app.config.ts` `prose: { appearance: "quiet" }` | `ginkoDocsSection.surface: "quiet"` in `nuxt.config.ts` |
| `app/components/SiteHeader.vue` imports `useCommandCenterState`, `useSiteNavigation` from `#ginko-docs/...` | `useDocsSearch()` and `useDocsNavigation()` (auto-imported); header links from the site's own config |
| `app/assets/css/tailwind.css` lines 95 to 146: `aside a[aria-current="page"]`, `nav[aria-label="Auf dieser Seite"] a`, `div:has(> .docs-toc-shell)` | Delete them. The current page chip and wrapping TOC entries are defaults now; the TOC shows by available space. Keep only token and layout variable overrides (`--site-header-height`, `--docs-sidebar-width-expanded`, `--docs-toc-width`, brand variables) |
| `--sidebar*` variables set by rolfing | Keep them: the shell reads the shadcn sidebar names (contracts section 2) |
| `content/dokumentation/4.layout-labor/2.magazin-layouts.md` uses `appearance="tint"` on `Aside` (2 times) | Remove the attribute |
| `4.layout-labor` folder (layout demos) | Ask the maintainer: delete or mark draft |

## Done when

- The checks in the proposal's "Migration for rolfing", step 8.
- `git grep -n "#ginko-docs\|:has(\|aria-label=\"Auf dieser Seite\"" -- app` returns nothing in rolfing.
- rolfing's `vp run verify` passes; screenshots at 375 and 1440 of `/`, `/dokumentation`, one deep page, search, and a 404 match production except for the intended docs styling.
- No production deploy without the maintainer's approval of that exact deploy.
