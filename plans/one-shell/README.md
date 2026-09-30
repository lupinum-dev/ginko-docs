# One docs shell: refactor spec

Status: approved direction (2026-09-30). This folder is the complete spec for the refactor. It is written so that an implementer (Codex) can do one brief at a time without design decisions.

- [plan.md](plan.md): why, decisions, outcome. Read once.
- [contracts.md](contracts.md): the public contract every brief builds on: tokens (full CSS), surface setting, layout variables, `data-docs-*` hooks, config changes, public composables, labels. **Single source of truth.**
- [briefs/](briefs/): one file per unit of work, in order. Each brief fits one Codex run and one pull request.
- [reference/prototype.html](reference/prototype.html): the approved visual prototype. Open it in a browser (`open plans/one-shell/reference/prototype.html`). Its CSS is the source for every pixel value not written in a brief. Published copy: https://claude.ai/artifact/UuSFM2dBrzvWiF3BUHXbsE (private).
- [tools/shots.mjs](tools/shots.mjs): the evidence script every brief uses.

## Order

Each brief starts from the latest `main` after the previous brief is merged. Do not start a brief before its dependency is merged.

| Brief | Work | Depends on | Size |
| --- | --- | --- | --- |
| [01](briefs/01-public-seams.md) | Public seams: `data-docs-*` hooks, layout variables, `useDocsSearch()`, `useDocsNavigation()` | #70 merged | S |
| [02](briefs/02-tokens.md) | Token contract, `surface` replaces `prose.appearance`, landing tokens leave the core | 01 | M |
| [03a](briefs/03a-sidebar.md) | Sidebar rebuild | 02 | M |
| [03b](briefs/03b-page.md) | Page: header row, TOC, mobile TOC, page end, stage and placements | 03a | M |
| [03c](briefs/03c-chrome.md) | Top bar, search dialog, mobile sheet | 03b | M |
| [04a](briefs/04a-text-blocks.md) | Callout (variant A), aside, excerpt, blockquote | 03c | M |
| [04b](briefs/04b-code-and-tables.md) | Code block, code group, code tree, collapse, tables | 04a | M |
| [04c](briefs/04c-content-objects.md) | Cards, read more, tabs, accordion, steps, timeline, files, figure | 04b | L |
| [04d](briefs/04d-api-and-quiz.md) | API panel, quiz | 04c | M |
| [04e](briefs/04e-layout-and-sets.md) | Layout blocks without chrome, remove `toc` and border types, component sets | 04d | M |
| [05a](briefs/05a-section-content.md) | `defineDocsSection` with generic locales | 04e | M |
| [05b](briefs/05b-section-module.md) | `@lupinum/ginko-docs/section` module, host-layout rendering, optional sidebar, article-end slot | 05a | L |
| [05c](briefs/05c-layer-on-section.md) | Rebuild the layer on section mode | 05b | L |
| [05d](briefs/05d-rolfing.md) | Migrate rolfing (other repository) | 05c released | M |
| [06](briefs/06-handbooks.md) | Handbooks and cleanup | 05d | S |

S: under 15 minutes, M: about 30 minutes, L: split into the commits the brief lists and report after each.

## Roles

- **Codex** implements one brief per run and opens its pull request.
- **Claude (Opus)** reviews every pull request against the prototype before merge (visual pass on the evidence screenshots, diff review). UI work gets this pass because exact values alone do not guarantee a good result.
- **Matthias** approves merges and releases.

## Rules for every brief

These apply to every brief. A brief can add rules; it never relaxes these.

1. Read [AGENTS.md](../../AGENTS.md), [contracts.md](contracts.md), and the brief. Read the files the brief lists before editing.
2. Start from the latest `origin/main`. Branch name: `feat/one-shell-<brief id>-<slug>` (for example `feat/one-shell-03a-sidebar`).
3. **Do not invent UI, layout, colors, spacing, or wording.** Every visible value comes from the brief, then from [contracts.md](contracts.md), then from the CSS in `reference/prototype.html`. If a visible detail is in none of them, keep the current look and list it under "Needs design decision" in the pull request.
4. Visible strings: use only the strings in the brief. Every string exists in English and German. German uses the informal "du" form, as the existing German docs do.
5. Change only the files the brief allows. Lockfiles and generated files (`layer/content.js`, `layer/authoring.generated.ts`) change only through their generators (`pnpm build`, `pnpm build:authoring`).
6. No color literals in component or shell CSS. Colors come from tokens. Literals are allowed only in `layer/app/assets/css/docs-tokens.css`, `landing-tokens.css`, `theme-palettes.css`, `theme-presets.css`, and the `:root` and `.dark` blocks of `tailwind.css`. Brief 02 adds a test that enforces this.
7. Keep English and German docs pages aligned. When a brief changes a docs page in `docs/content/en`, change its German twin in `docs/content/de` in the same commit.
8. Tests: add only the tests the brief names. Each one states the wrong behavior it catches.
9. Commits: atomic Conventional Commits, as listed in the brief. End each commit message with the co-author line the repository uses. Commit before reporting.
10. Ports: use port 3120 for the built docs site. Never use ports 3000 to 3011 (the maintainer's dev servers). Stop every process you started.
11. Component kit files (every component in `layer/authoring.ts` `implementation`, plus what they import) run in sites without the layer: use relative imports (never `#ginko-docs/...`), `useDocsText()` for strings (never `useI18n()`), and read `useAppConfig().ginkoDocs` as possibly undefined. `pnpm release:verify` checks this.
12. Stop and report instead of guessing when: a listed file does not exist, a check fails for a reason outside the brief, or the brief conflicts with [contracts.md](contracts.md).

## Evidence (every brief)

Take "before" evidence on `main` before changing anything and "after" evidence on the branch. Store it outside Git in `.evidence/<brief id>/` (the folder is ignored; see brief 01).

```bash
pnpm docs:build
```

```bash
PORT=3120 node docs/.output/server/index.mjs
```

In a second shell:

```bash
node plans/one-shell/tools/shots.mjs --base http://localhost:3120 --out .evidence/03a/before
```

The script writes screenshots at 375 and 1440 px, light and dark, for the default routes (a docs page, the component showcase, the editorial layouts page, a German page), plus `report.json` with console errors and serious or critical axe violations. Pass `--routes` for other pages and `--full` for full-page screenshots.

Known baseline on `main` (before brief 01): the component showcase has two axe violations: `color-contrast` on the aside and excerpt labels, and `list` on the code tree. Brief 04a fixes the contrast and brief 04b fixes the list. No other brief may add a violation.

## Done when (every brief)

- The brief's own "Done when" list passes.
- `pnpm verify` passes.
- `pnpm release:verify` passes when the brief says so (any brief that changes markup used by the certification, package exports, or dependencies).
- `shots.mjs` exits 0 on the branch, or the pull request explains each remaining violation that also exists on `main`.
- The pull request contains: what changed, before and after screenshots (1440 light, 1440 dark, 375 light at least), the `report.json` summary, the checks you ran with their results, and "Needs design decision" items if any.

## Copy-paste prompt for Codex

Replace `<id>` with the brief id.

```text
Implement brief <id> of the Ginko Docs one-shell refactor.

Read, in this order: AGENTS.md, plans/one-shell/README.md, plans/one-shell/contracts.md,
plans/one-shell/briefs/<id>-*.md. Follow the "Rules for every brief" in the README exactly.
Do not invent UI, colors, spacing, or wording: use the values in the brief, then contracts.md,
then the CSS in plans/one-shell/reference/prototype.html. Anything not specified keeps its
current look and goes under "Needs design decision" in the pull request.

Work on a new branch from the latest origin/main. Take before evidence on main and after
evidence on the branch with plans/one-shell/tools/shots.mjs (port 3120; never ports
3000-3011). Commit as the brief lists, run the brief's checks and `pnpm verify`, push, and
open a pull request with the evidence. Report the PR URL, the checks with their results,
and anything you could not verify.
```

## Glossary

| Term | Meaning |
| --- | --- |
| Shell | Everything around the article: top bar, sidebar, table of contents (TOC), page head, page end. |
| Stage | The area next to the sidebar that holds the article and the TOC. |
| Placement | Where the shell sits: `standalone` (full page, lib docs default), `inset` (stage as a rounded card on a tinted ground), or inside a host website (section mode, brief 05b). |
| Surface | `framed` (default) or `quiet`. A token set, not a second stylesheet. Framed boxes objects and tints callouts; quiet uses rules and lines only. |
| Frame | The outer box of an object: radius `--docs-radius-frame` (14 px), padding `--docs-frame-pad` (4 px), background `--docs-frame`. |
| Head, foot | Rows inside a frame, above and below the panel: a title, tabs, actions, a caption. |
| Panel | The content box inside a frame: radius `--docs-radius-panel` (10 px), background `--docs-panel`. |
| Line | The rounded 3 px line of text blocks (callout, aside, excerpt, blockquote). Its own element, never a border on a rounded box. |
| Row | One interactive line in a list (sidebar item, menu item, file): height 32 px, radius `--docs-radius-row` (8 px). |
| Chip | The selected state of a choice: background `--docs-selected` with `--docs-selected-shadow`. Used for the current tab, the current section tab, the selected code tree file. The current sidebar page uses the shadcn sidebar fill (`--sidebar-accent`) instead, as in the prototype. |
| Tone | The meaning color of a callout: note, info, success, warning, error, idea. |
| Brand variables | The shadcn variables a host sets (`--background`, `--primary`, ...). Everything else derives from them. |
