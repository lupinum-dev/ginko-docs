<p align="center">
  <img src="docs/public/web-app-manifest-512x512.png" width="128" alt="Ginko Docs icon">
</p>

<h1 align="center">Ginko Docs</h1>

<p align="center">Turn Nuxt content into a complete documentation site with navigation, search, localization, SEO, feedback, and agent-readable output.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@lupinum/ginko-docs"><img src="https://img.shields.io/npm/v/@lupinum/ginko-docs?color=00DC82" alt="npm version"></a>
  <a href="https://github.com/lupinum-dev/ginko-docs/actions/workflows/ci.yml"><img src="https://github.com/lupinum-dev/ginko-docs/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
</p>

> [!WARNING]
> Ginko Docs is stable in the 0.3 release line. Because it is pre-1.0, a later minor release can contain breaking changes.

## Why use Ginko Docs?

Ginko Docs supplies the parts that most documentation sites need after Markdown rendering works. It adds a documentation shell, content navigation, search, localization, canonical metadata, social images, feedback, optional blog routes, and machine-readable content.

Your application owns its content, identity, and deployment. Ginko Docs owns the reusable Nuxt presentation. Ginko Content owns document identity, routes, search records, and agent output.

## When to use it

Use Ginko Docs when you need a focused product or developer documentation site on Nuxt 4. It is useful when humans, search engines, and coding agents must consume the same canonical content.

Ginko Docs is not suitable for a general website builder or a visual page editor. Use Ginko Content directly when you need a custom application shell.

## Requirements

- Node.js 22.18, 24.11, or 26 and later maintenance releases
- Nuxt 4.5.1 or later in the Nuxt 4 line
- Vue 3.5.35 or later
- Ginko Content 0.4 prerelease or later in the 0.4 line

## Installation

Install the layer and its content peer:

```bash
pnpm add -D @lupinum/ginko-docs@0.4.0-rc.6 @lupinum/ginko-content@1.0.0-beta.5
```

Extend the layer:

```ts
export default defineNuxtConfig({
  extends: ["@lupinum/ginko-docs"],
  site: { url: "https://docs.example.com" },
  i18n: { baseUrl: "https://docs.example.com" },
});
```

## Quick start

Define one documentation collection:

```ts
import { defineGinkoDocsConfig } from "@lupinum/ginko-docs/content";

export default defineGinkoDocsConfig({
  site: {
    name: "Example Docs",
    description: "Documentation for Example.",
    whenToUse: "Use this site to learn and operate Example.",
  },
  locales: ["en"],
  blog: false,
});
```

Add `content/docs/1.introduction.md`:

```md
---
title: Introduction
description: Learn what Example does and how to use it.
---

Example solves a specific problem.
```

Run the Nuxt development server and open `/docs`. Ginko Docs redirects the base route to the first navigable page.

## Core concepts

- Collections provide one source for pages, navigation, search, sitemap entries, and agent output.
- The consuming application owns its public name, URL, content, locale records, and integrations.
- Static builds include search, raw Markdown, LLM catalogs, sitemap, robots, and social images.
- A Nitro server also supports Markdown content negotiation, response link headers, and read-only MCP tools.
- Nuxt application overrides remain available for pages, layouts, components, and CSS.

## Documentation

Read the [Ginko Docs documentation](https://ginko-docs.lupinum.com). Start with the [installation guide](https://ginko-docs.lupinum.com/docs/getting-started/installation).

Use the [app configuration reference](https://ginko-docs.lupinum.com/docs/reference/app-config) for exact options. The [changelog](./CHANGELOG.md) records release changes.

## Contributing and development

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before you open a pull request. Maintainers use [MAINTAINING.md](./MAINTAINING.md) for dependency updates, releases, rollback, and incidents.

Run the normal handoff gate:

```bash
pnpm verify
```

## Support and security

Open a [GitHub issue](https://github.com/lupinum-dev/ginko-docs/issues) for reproducible defects and focused requests. Join the [Lupinum OSS Discord](https://discord.gg/RPH6SeA36N) for community support.

Do not report vulnerabilities in public issues. Follow [SECURITY.md](./SECURITY.md) to send a private report.

## License

Ginko Docs is developed by [Lupinum OG](https://lupinum.com) and released under the [MIT License](./LICENSE).
