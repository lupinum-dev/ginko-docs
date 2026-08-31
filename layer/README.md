<p align="center">
  <img src="https://raw.githubusercontent.com/lupinum-dev/ginko-docs/main/docs/public/web-app-manifest-512x512.png" width="128" alt="Ginko Docs icon">
</p>

<h1 align="center">@lupinum/ginko-docs</h1>

<p align="center">Add a complete documentation experience to a Nuxt application through one reusable layer.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@lupinum/ginko-docs"><img src="https://img.shields.io/npm/v/@lupinum/ginko-docs?color=00DC82" alt="npm version"></a>
  <a href="https://github.com/lupinum-dev/ginko-docs/actions/workflows/ci.yml"><img src="https://github.com/lupinum-dev/ginko-docs/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="https://github.com/lupinum-dev/ginko-docs/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
</p>

> [!WARNING]
> This package is stable in the 0.3 release line. Because it is pre-1.0, a later minor release can contain breaking changes.

## Purpose

Use this package when a Nuxt application needs documentation routes, navigation, search, localization, metadata, social images, feedback, and agent-readable content. The layer provides the interface while the consuming application keeps ownership of its content and identity.

## Requirements

- Node.js 22.18, 24.11, or 26 and later maintenance releases
- Nuxt 4.5.1 or later in the Nuxt 4 line
- Vue 3.5.35 or later
- Ginko Content 0.4 prerelease or later in the 0.4 line

## Installation

```bash
pnpm add -D @lupinum/ginko-docs@0.4.0-rc.6 @lupinum/ginko-content@1.0.0-beta.5
```

```ts
export default defineNuxtConfig({
  extends: ["@lupinum/ginko-docs"],
  site: { url: "https://docs.example.com" },
  i18n: { baseUrl: "https://docs.example.com" },
});
```

## Quick start

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

Put Markdown files in `content/docs`. Open `/docs` after the Nuxt server starts.

## Exports

- `@lupinum/ginko-docs` is the Nuxt layer entry.
- `@lupinum/ginko-docs/content` exports `defineGinkoDocsConfig`.
- `@lupinum/ginko-docs/app-config` exports application configuration types.
- `@lupinum/ginko-docs/components` exports the public MDC component contract.

## Documentation

Read the [Ginko Docs documentation](https://ginko-docs.lupinum.com) and the [root README](https://github.com/lupinum-dev/ginko-docs#readme).

## Support and security

Use [GitHub issues](https://github.com/lupinum-dev/ginko-docs/issues) or the [Lupinum OSS Discord](https://discord.gg/RPH6SeA36N) for support. Report vulnerabilities through the [private security process](https://github.com/lupinum-dev/ginko-docs/security/policy).

## License

Released by [Lupinum OG](https://lupinum.com) under the [MIT License](https://github.com/lupinum-dev/ginko-docs/blob/main/LICENSE).
