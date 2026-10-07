# Brief 04a: text blocks (callout, aside, excerpt, blockquote)

Goal: the four text blocks share one rounded line. Callouts use variant A: a 3 px line in the tone color and a title row (icon plus title) in the tone ink; framed adds a light tint behind it, quiet is the line alone. Aside, excerpt, and blockquote use a neutral line.

Depends on: 03c. Release check: **yes** (the component kit is certified on its own).

Prototype reference: page "Callouts and quotes" (both surfaces) and page "Callout variants", variant A. CSS: `.rail*`, `.callout`, `.co-head`, `.co-body`, `.callout.v-a`, `[data-cs]`, `.aside`, `.excerpt*`, `.prose blockquote` (prototype lines 296 to 393).

## Read first

- [contracts.md](../contracts.md) sections 2, 3, 8
- `layer/app/components/mdc/MdcCallout.vue`, `MdcNote.vue`, `MdcInfo.vue`, `MdcSuccess.vue`, `MdcWarning.vue`, `MdcError.vue`, `MdcIdea.vue`, `MdcAside.vue`, `MdcExcerpt.vue`
- `layer/app/components/prose/ProseBlockquote.vue` (turns GitHub alert syntax into callouts)
- `layer/app/assets/css/component-kit.css` lines 395 to 569 (callout, aside, excerpt) and 96 to 115 (display excerpt)
- `layer/app/assets/css/prose.css` lines 140 to 160 (`blockquote`)
- `layer/i18n/messages/global/docs.ts`, `layer/i18n/messages/global/index.ts`
- `scripts/certify-component-kit.mjs`

## Scope

Allowed: the files above and `layer/i18n/messages/global/callout.ts` (new).

Forbidden: other components; the callout type names and props (`title`, `type`, `icon`); the GitHub alert parsing in `ProseBlockquote.vue`.

## Changes

### 1. Callout markup (`MdcCallout.vue`)

```vue
<div data-slot="alert" role="note" :class="cn('content-callout not-prose', `content-callout-${type}`, props.class)">
  <span class="content-callout-bar" aria-hidden="true" />
  <div data-slot="alert-title" class="content-callout-head">
    <Icon :name="iconName" aria-hidden="true" />
    <span>{{ title ?? t(`callout.${type}`) }}</span>
  </div>
  <div data-slot="alert-description" class="content-callout-body content-prose content-prose-trim">
    <slot unwrap="p" />
  </div>
</div>
```

- The title row is always shown. Without a `title` prop it shows the tone label from [contracts.md](../contracts.md) section 8.
- Remove `data-appearance` and the `useProseAppearance` call from all callout files.
- Labels: create `layer/i18n/messages/global/callout.ts` with the six keys (English and German from contracts section 8), following the shape of `docs.ts`, and register it in `index.ts`. Read them with `const { t } = useDocsText()` from `layer/app/composables/useDocsText.ts` (relative import), like `MdcFigure.vue`. Never `useI18n()`: the component kit runs in sites without `@nuxtjs/i18n`, where it does not exist.

### 2. Callout CSS (replace the callout block in `component-kit.css`)

```css
.content-callout {
  --docs-tone: var(--docs-tone-info);
  --docs-tone-ink: color-mix(in oklab, var(--docs-tone) 70%, var(--foreground));
  position: relative;
  margin-block: 1.25rem;
  padding-block: var(--docs-callout-py);
  padding-inline: calc(var(--docs-callout-inset) + 18px) var(--docs-callout-px);
  border-radius: calc(var(--radius) + 2px);
  background: color-mix(in oklab, var(--docs-tone) var(--docs-tone-fill), transparent);
  font-size: 0.9375rem;
}
.content-callout-note { --docs-tone: var(--docs-tone-note); }
.content-callout-info { --docs-tone: var(--docs-tone-info); }
.content-callout-success { --docs-tone: var(--docs-tone-success); }
.content-callout-warning { --docs-tone: var(--docs-tone-warning); }
.content-callout-error { --docs-tone: var(--docs-tone-error); }
.content-callout-idea { --docs-tone: var(--docs-tone-idea); }
.content-callout-bar {
  position: absolute;
  inset-inline-start: var(--docs-callout-inset);
  top: calc(var(--docs-callout-py) + 2px);
  bottom: calc(var(--docs-callout-py) + 2px);
  width: 3px;
  border-radius: 3px;
  background: var(--docs-tone);
}
.content-callout-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.84375rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--docs-tone-ink);
}
.content-callout-head svg,
.content-callout-head .iconify {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
.content-callout-body {
  margin-top: 4px;
  color: color-mix(in oklab, var(--foreground) 86%, var(--muted-foreground));
}
.content-callout-body p + p {
  margin-top: 8px;
}
```

Delete the old `.content-callout*`, `.content-alert-title`, `--content-callout-accent`, `--content-callout-surface`, and `[data-appearance]` callout rules.

### 3. Aside, excerpt, blockquote CSS

Replace the aside and excerpt blocks in `component-kit.css`:

```css
.content-aside,
.content-excerpt[data-size="body"] {
  position: relative;
  margin-block: 1.25rem;
  padding-block: 1px;
  padding-inline-start: 18px;
}
.content-aside::before,
.content-excerpt[data-size="body"]::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 3px;
  bottom: 3px;
  width: 3px;
  border-radius: 3px;
  background: var(--docs-border-strong);
}
.content-aside {
  font-size: 0.90625rem;
}
.content-aside-body {
  color: color-mix(in oklab, var(--foreground) 80%, var(--muted-foreground));
}
.content-aside p.content-aside-label,
.content-excerpt p.content-excerpt-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 4px;
  font-size: 0.84375rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--muted-foreground);
}
.content-excerpt-body {
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.55;
  letter-spacing: -0.005em;
  color: var(--foreground);
}
.content-excerpt-source {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.8125rem;
  color: var(--muted-foreground);
}
.content-excerpt-source::before {
  content: "";
  width: 14px;
  height: 1px;
  background: var(--docs-border-strong);
}
.content-excerpt[data-size="display"] {
  margin-block: 1.5rem;
  padding-block: 8px;
}
.content-excerpt[data-size="display"] p.content-excerpt-label {
  font-size: 0.78125rem;
  font-weight: 500;
}
.content-excerpt[data-size="display"] .content-excerpt-body,
.content-excerpt[data-size="display"] .content-excerpt-body p {
  margin-top: 6px;
  font-size: clamp(1.375rem, 3.2vw, 1.75rem);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.02em;
  text-wrap: balance;
}
```

Delete the old aside and excerpt rules, including every `[data-appearance]` variant and the display excerpt rules at lines 96 to 115.

In `prose.css`, the plain blockquote (lines 143 to 160) becomes:

```css
.content-prose :where(blockquote) {
  position: relative;
  margin-inline: 0;
  padding-block: 1px;
  padding-inline-start: 18px;
  color: color-mix(in oklab, var(--foreground) 80%, var(--muted-foreground));
}
.content-prose :where(blockquote)::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 3px;
  bottom: 3px;
  width: 3px;
  border-radius: 3px;
  background: var(--docs-border-strong);
}
.content-prose :where(blockquote > p) {
  margin: 0;
}
.content-prose :where(blockquote > p + p) {
  margin-top: 8px;
}
```

The excerpt's inner `<blockquote>` must not get this line twice: `.content-excerpt` is `not-prose`; check that the excerpt shows one line only (the prototype had this bug once).

Remove `data-appearance` and `useProseAppearance` from `MdcAside.vue` and `MdcExcerpt.vue`.

## Visible strings

The six callout labels (contracts section 8).

## Done when

- The component showcase in both locales shows all six callout tones, with and without a title, as variant A. With `theme.surface: "quiet"` (local only) they show the line alone, and the text starts flush with the surrounding paragraphs plus 18 px.
- A GitHub alert (`> [!WARNING]`) in Markdown renders the warning callout with the label "Warning" / "Warnung".
- The aside and excerpt `color-contrast` axe violations from the baseline are gone.
- The component kit fixture (`pnpm release:verify`) renders a callout label (English), not a translation key.
- `git grep -n "data-appearance" -- layer/app/components/mdc/MdcCallout.vue layer/app/components/mdc/MdcAside.vue layer/app/components/mdc/MdcExcerpt.vue` returns nothing.
- `pnpm verify` and `pnpm release:verify` pass; `shots.mjs` exits 0.

## Commits

1. `feat(components): callouts with a tone line and a title row`
2. `feat(components): one neutral line for aside, excerpt, and blockquote`
