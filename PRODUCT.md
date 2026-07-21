# Ginko Docs product

## Purpose

Ginko Docs is a publishable Nuxt layer for product and developer documentation. A consumer supplies Markdown, identity, and optional presentation overrides. The layer supplies the documentation shell, content routes, navigation, search, localization, SEO, social images, and agent-readable output.

The product succeeds when a maintainer can start with an existing Nuxt application, publish a useful first page without rebuilding a theme, and keep the site understandable as the documentation grows.

## Users

Ginko Docs serves teams that own a Nuxt product and need a maintained documentation site without creating a second frontend platform. Typical users are:

- maintainers publishing API, integration, or product documentation;
- documentation engineers responsible for navigation and authoring conventions;
- teams that need English and German content from one site;
- teams that want the same canonical content available to readers, search engines, and software agents.

It is not a hosted CMS, a visual editor, or a general marketing-site builder.

## Product boundaries

Ginko Content owns document identity, collection schemas, routes, locale variants, search data, sitemaps, and agent representations. Ginko Docs presents those capabilities through a Nuxt application shell. Consumers own their content, brand, locale selection, repository links, analytics choices, and deployment.

Each concern must keep one authoring source:

- `content.config.ts` defines collections and whether the blog exists;
- `app/app.config.ts` defines public presentation settings;
- Markdown and data files define the published content;
- `.navigation.yml` files define sidebar sections and groups;
- Nuxt configuration defines framework and deployment behavior.

## Product principles

1. **Useful on the first page.** The default shell should need content and identity, not a theme-building project.
2. **Nuxt-native customization.** Consumers override pages, layouts, components, and CSS through normal Nuxt conventions.
3. **One content model.** Rendered pages, search, SEO, raw Markdown, LLM catalogs, and MCP must derive from the same documents.
4. **Structure over ornament.** Navigation should expose the reader's location and choices without decorative hierarchy.
5. **Static where possible, runtime where required.** Static deployments keep prerendered content and discovery assets; runtime-only capabilities must be described honestly.
6. **Accessible by default.** Keyboard navigation, focus states, semantic landmarks, contrast, reduced motion, and readable text are release requirements.
7. **Safe authored components.** Markdown components use explicit static prop and slot policies rather than unrestricted Vue execution.

## Documentation standard

The playground is the reference consumer and the public documentation site. Its content must teach the package, not describe tests or internal migrations. Examples use public consumer APIs and commands. Reference pages follow source types and exports. English and German pages remain structurally equivalent.

The detailed writing contract lives in [`docs/WRITING.md`](./docs/WRITING.md).
