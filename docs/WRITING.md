# Documentation writing contract

Ginko Docs uses Lupinum Controlled English. This profile is based on ASD-STE100
Issue 9. It does not claim formal ASD-STE100 compliance.

Separate pages by reader intent. Put working examples before secondary detail.
Keep navigation shallow.

Use short, active sentences. Put one instruction in each sentence. Use one term
for one concept. Define a technical term before you use it. Use American English
spelling in English content.

## Organize by intent

Every page has one primary job:

- **Quickstart** produces the first working result.
- **Concepts** explain a mental model, default, or tradeoff.
- **Authoring and feature guides** complete a specific task.
- **Reference** lists a public type, option, schema, component, or export exhaustively.
- **Operations** diagnose or deploy a consumer site.

Do not mix maintainer workflow, playground acceptance criteria, and consumer guidance. Repository commands belong in `AGENTS.md` or `MAINTAINING.md`; public pages use commands a consuming Nuxt project can run.

## Write for the reader's next action

- Open with the result, definition, or constraint.
- Use active voice and direct instructions.
- Prefer “Add the layer to `extends`” over “The layer can be added.”
- Label code fences with their real file path.
- Show one concept per example.
- Introduce alternatives where the reader must choose between them.
- State defaults and the observable result.
- Put warnings immediately before the action they affect.

Avoid subjective filler such as “simply,” “just,” “obviously,” “easy,” and “seamless.” Avoid internal proof language such as “verify the fixture,” “acceptance test,” or “this page demonstrates.”

## Page structure

Frontmatter supplies the page title and description. Do not add a body-level `#` heading.

```yaml
---
title: Configure navigation
description: Divide the generated content tree into sidebar sections and groups.
navigation:
  title: Navigation
  icon: lucide:panel-left
---
```

Use nested YAML for `navigation`; dotted keys are not portable through the current Markdown pipeline.

Use sentence case for page titles and headings. A task title starts with a verb when that makes the outcome clearer. A reference title uses the exact public symbol or configuration name.

## Structure public READMEs

Center the 128 px product icon, product name, one-sentence value proposition,
and npm, CI, and MIT badges. State the release status for an unstable package.

The root README then explains why and when to use the product, requirements,
installation, the smallest useful example, concepts, documentation,
contribution, support, security, and license. The published package README uses
a compact version of the same order. Explain user outcomes before internal
architecture. Keep fixture, license, migration, and proof READMEs technical and
unbranded.

## Examples and callouts

Examples must compile against the current public package contract. Do not expose layer-internal composables, aliases, or route components as consumer APIs.

Use callouts sparingly:

- `note` adds relevant context;
- `info` explains a behavior the reader may not expect;
- `warning` identifies a likely failure or deployment constraint;
- `success` confirms an observable result.

Required setup belongs in the main flow, not only in a callout.

## Navigation

Numeric path prefixes control order and do not appear in public URLs. Folder-level `.navigation.yml` files own sidebar structure:

```yaml
title: Documentation
icon: lucide:book-open
sidebar: section
```

Use `sidebar: section` for a primary area and `sidebar: group` for a flat heading inside that area. Add an index page only when the folder needs a real destination; do not create overview pages to prove nesting.

The English and German trees use the same numeric identities. German pages use canonical English collection references such as `$docs/authoring/links`; Ginko Content resolves the translated public route.

## Endings

End on the final useful instruction, constraint, example, or expected result. The application already renders previous and next page controls.

Do not append generic sections named:

- “What's next” or “Next steps”;
- “Related” or “See also”;
- “Conclusion” or “Summary.”

Place a related link where it becomes relevant instead of collecting discovery links at the bottom of every page.

## Source accuracy

Use these files as the public contract:

- `layer/content.ts` for content configuration and schemas;
- `layer/shared/types/app-config.ts` and `layer/app/app.config.ts` for presentation options and defaults;
- `layer/tags.ts` for authored component tags and policies;
- `layer/package.json` and `layer/components.ts` for package exports and compatibility;
- `layer/nuxt.config.ts` for built-in modules, search, SEO, and agent behavior.

When documentation and source disagree, correct the documentation or the public contract in the same change. Do not preserve both descriptions.
