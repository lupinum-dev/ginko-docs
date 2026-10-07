# Brief 04d: API panel and quiz

Goal: the API panel reads name first, with a muted type, a neutral "Required" mark, and one meta line for default and version. The quiz uses the frame grammar with clear option states. The last `--accent-*` and `--chart-*` uses leave the component CSS.

Depends on: 04c. Release check: no.

Prototype reference: page "Gallery", sections "API" and "Quiz" (both surfaces). CSS: `.api*`, `.api-group`, `.api-entry*`, `.api-sig*`, `.api-meta*`, `.quiz*`, `.opts`, `.opt*`, `.chip-btn` (prototype lines 152 to 155, 531 to 552, 570 to 592).

## Read first

- [contracts.md](../contracts.md) sections 2, 8
- `layer/app/components/mdc/MdcApi.vue`, `api.utils.ts`, `api.utils.test.ts`
- `layer/app/components/mdc/MdcQuiz.vue`, `MdcQuizQuestion.vue`, `quiz.utils.ts`
- `layer/app/assets/css/prose.css` sections "API" (about lines 2001 to 2188) and "Quiz" (about 2189 to 2585)
- The "Shared object rules" in [04b](04b-code-and-tables.md)

## Scope

Allowed: the files above, `layer/i18n/messages/global/api.ts` (new) and `index.ts`, `layer/app/assets/css/tailwind.css` and `layer/app/assets/css/theme-presets.css` (only to delete `--accent-*` and `--chart-*` once unused, step 3).

Forbidden: API data parsing and validation (`normalizeApiGroups`), anchor ids (`apiEntryId`), quiz scoring and state logic.

## Buttons

Add to `prose.css` (the quiz uses them; later briefs may too):

```css
.docs-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--docs-radius-row);
  background: var(--docs-chip);
  box-shadow: var(--docs-shadow-chip);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--foreground);
}
.docs-button:hover {
  background: var(--muted);
}
.docs-button[data-variant="primary"] {
  background: var(--foreground);
  box-shadow: none;
  color: var(--background);
}
.docs-button[data-variant="primary"]:hover {
  opacity: 0.9;
}
.docs-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
.docs-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## 1. API panel (`MdcApi.vue`)

Structure:

```
div.content-api.docs-frame
  div.docs-frame-head
    identity: method chip + path, or icon + title   (docs-frame-title)
    div.docs-tabs[role=tablist]  (only when there is more than one group)
      button.docs-tab[role=tab]  "Props" + count
  div.docs-panel
    div[role=tabpanel] per group
      div.content-api-row  (one per entry, id = apiEntryId)
        div.content-api-sig:  name · type · Required · Deprecated
        div.content-api-description
        div.content-api-meta: Default `x` · Since 1.2     (only when default or since exists)
        a.content-api-anchor  (link to the row id, shown on hover and focus)
```

With exactly one group, the head shows the group label as plain text (`docs-frame-title`) and its count instead of tabs.

CSS:

```css
.content-api-method {
  padding: 3px 7px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: color-mix(in oklab, var(--api-method) 10%, var(--docs-panel));
  color: color-mix(in oklab, var(--api-method) 70%, var(--foreground));
}
.content-api-method[data-method="GET"] { --api-method: var(--docs-tone-info); }
.content-api-method[data-method="POST"] { --api-method: var(--docs-tone-success); }
.content-api-method[data-method="PUT"],
.content-api-method[data-method="PATCH"] { --api-method: var(--docs-tone-warning); }
.content-api-method[data-method="DELETE"] { --api-method: var(--docs-tone-error); }
.content-api-method:not([data-method]) { --api-method: var(--muted-foreground); }
.content-api-path {
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.content-api-count {
  font-variant-numeric: tabular-nums;
  color: var(--muted-foreground);
  font-weight: 400;
}
.content-api-row {
  position: relative;
  padding: 14px 18px;
}
.content-api-row + .content-api-row {
  border-top: 1px solid var(--border);
}
.content-api-sig {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
  padding-inline-end: 28px;
}
.content-api-name {
  font-family: var(--font-mono);
  font-size: 0.84375rem;
  font-weight: 600;
  color: var(--foreground);
}
.content-api-name-deprecated {
  color: var(--muted-foreground);
  text-decoration: line-through;
  text-decoration-color: var(--muted-foreground);
}
.content-api-type {
  font-family: var(--font-mono);
  font-size: 0.78125rem;
  color: var(--muted-foreground);
}
.content-api-required {
  padding: 0 7px;
  border: 1px solid var(--docs-border-strong);
  border-radius: 999px;
  font-size: 0.71875rem;
  font-weight: 500;
  line-height: 18px;
  color: var(--foreground);
}
.content-api-deprecated {
  font-size: 0.71875rem;
  font-weight: 500;
  color: color-mix(in oklab, var(--docs-tone-warning) 70%, var(--foreground));
}
.content-api-description {
  max-width: 62ch;
  margin-top: 5px;
  font-size: 0.90625rem;
  color: color-mix(in oklab, var(--foreground) 86%, var(--muted-foreground));
}
.content-api-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-top: 8px;
  font-size: 0.78125rem;
  color: var(--muted-foreground);
}
.content-api-meta code,
.content-api-inline-code {
  padding: 1px 5px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--muted);
  font-size: 0.75rem;
  color: var(--foreground);
}
.content-api-anchor {
  position: absolute;
  top: 14px;
  inset-inline-end: 12px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: var(--muted-foreground);
  opacity: 0;
  transition: opacity 120ms;
}
.content-api-row:hover .content-api-anchor,
.content-api-anchor:focus-visible {
  opacity: 1;
}
.content-api-anchor:hover {
  background: var(--muted);
  color: var(--foreground);
}
```

Behavior changes:

- `signatureTail` returns only `?` and `: annotation` (the default moves to the meta line). Update its test: `{ optional: true, annotation: '"sm" | "md"', default: '"md"' }` gives `'?: "sm" | "md"'`. Wrong behavior it catches: the default shows twice or not at all.
- The method chip gets `:data-method="method.toUpperCase()"`.
- Replace the hard-coded `required`, `deprecated`, `since` badge texts with `t("api.required")`, `t("api.deprecated")`, `t("api.since", { version: entry.since })`; the meta line shows `t("api.default")` followed by the default in `code`, and the since text. Create `layer/i18n/messages/global/api.ts` with the keys from [contracts.md](../contracts.md) section 8 and register it.
- The anchor is `<a class="content-api-anchor" :href="'#' + apiEntryId(...)" :aria-label="entry.name">` with `lucide:link` (14 px).
- Keep the tab keyboard handling, `aria-*`, and panel ids.
- Delete the old API rules, including every `--accent-blue*`, `--accent-coral*`, `--accent-yellow*`, `--accent-mint*` use, and every `[data-appearance]` API rule.

## 2. Quiz (`MdcQuiz.vue`, `MdcQuizQuestion.vue`)

- Quiz root gets `docs-frame`. Head (`docs-frame-head`): the title as `docs-frame-title`, then the progress text (`.content-quiz-progress`, existing text) at the end.
- Body gets `docs-panel` with `padding: 16px`. Questions after the first: `margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--border)` (only when several questions show at once).
- Question title `display: block; font-size: 0.9375rem; font-weight: 600`; hint (`multipleChoiceLabel` etc.) `display: block; margin-top: 2px; font-size: 0.78125rem; color: var(--muted-foreground)`.
- Options list: `display: flex; flex-direction: column; gap: 6px; margin-top: 10px`.

```css
.content-quiz-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--docs-radius-panel);
  font-size: 0.90625rem;
  text-align: start;
  transition: border-color 120ms, background-color 120ms;
}
.content-quiz-option:hover {
  border-color: var(--docs-border-strong);
}
.content-quiz-option-key {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1.5px solid var(--docs-border-strong);
  border-radius: 999px;
}
.content-quiz-option[data-multiple] .content-quiz-option-key {
  border-radius: 5px;
}
.content-quiz-option[aria-checked="true"] {
  border-color: var(--foreground);
  background: color-mix(in oklab, var(--muted) 60%, transparent);
}
.content-quiz-option[aria-checked="true"] .content-quiz-option-key {
  border-color: var(--foreground);
  background: var(--foreground);
}
.content-quiz-option[aria-checked="true"] .content-quiz-option-key::after {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--background);
}
.content-quiz-option[data-multiple][aria-checked="true"] .content-quiz-option-key::after {
  border-radius: 1px;
}
.content-quiz-option[data-result="correct"] {
  border-color: color-mix(in oklab, var(--docs-tone-success) 50%, var(--border));
  background: color-mix(in oklab, var(--docs-tone-success) 8%, var(--background));
}
.content-quiz-option[data-result="incorrect"] {
  border-color: color-mix(in oklab, var(--docs-tone-error) 50%, var(--border));
  background: color-mix(in oklab, var(--docs-tone-error) 8%, var(--background));
}
.content-quiz-option-result {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-inline-start: auto;
  font-size: 0.78125rem;
  font-weight: 500;
}
.content-quiz-option[data-result="correct"] .content-quiz-option-result {
  color: color-mix(in oklab, var(--docs-tone-success) 70%, var(--foreground));
}
.content-quiz-option[data-result="incorrect"] .content-quiz-option-result {
  color: color-mix(in oklab, var(--docs-tone-error) 70%, var(--foreground));
}
.content-quiz-explanation {
  margin: 10px 0 0;
  font-size: 0.875rem;
  color: var(--muted-foreground);
}
```

- Map the component's existing state attributes onto these selectors. If the component marks state differently (for example classes instead of `aria-checked` or `data-result`), add the attributes above to the markup and keep the old state logic; the option role and checked state must be exposed to assistive technology either way (`role="radio"` / `role="checkbox"` with `aria-checked`, or native inputs). Record what you found.
- Actions (Check, Next, Back, Reset, Results) move into a `docs-frame-foot` with `gap: 8px`: the main action is `button.docs-button[data-variant="primary"]`, the others `button.docs-button`. The result message (`.content-quiz-result`) sits in the foot at the start, 13 px, error tone ink when incorrect.
- Results screen: keep its content; the score uses `font-size: 1.5rem; font-weight: 600`; its icon sits in a `docs-icon-tile`.
- Delete every `[data-appearance]` quiz rule and the old quiz surface rules. A standalone `quiz-question` (outside a quiz) gets the same frame.

## 3. Remove the last landing colors

After the API and quiz changes, run `git grep -n "accent-blue\|accent-mint\|accent-yellow\|accent-coral\|--chart-" -- layer docs`. If the only hits are the definitions in `tailwind.css` (`:root`, `.dark`, `@theme inline`) and `theme-presets.css`, delete those definitions. If something else still uses them, stop and report the file.

## Done when

- The API demos (with method and path, with title, one group, several groups, deprecated entry, entry with default and since) and the quiz demos (single, multiple choice, correct and incorrect results, results screen) match the prototype in both surfaces and schemes, in English and German.
- `git grep -n "data-appearance" -- layer/app/components/mdc/MdcApi.vue layer/app/components/mdc/MdcQuiz.vue layer/app/components/mdc/MdcQuizQuestion.vue` returns nothing.
- `pnpm verify` passes; `shots.mjs` exits 0.

## Commits

1. `feat(components): API panel with name-first rows and localized marks`
2. `feat(components): frame the quiz with clear option states`
3. `refactor(theme): remove unused accent and chart tokens`
