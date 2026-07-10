# Lupinum Website

The German-first Lupinum business website and reference implementation for content-rich agency sites. It combines conversion-focused marketing pages, campaign landing pages, services, references, blog, public documentation, localized Markdown content, search, consent-aware integrations, forms, and structured data in one Nuxt application.

## Requirements

- Use `vp` when available. In this repo the dev server command is `vp run dev`.
- Configure `NUXT_PUBLIC_SITE_URL` when canonical URLs should point at a deployed
  host.

Copy `.env.example` to `.env` only when you need local overrides for the site
URL, analytics IDs, Basin endpoints, or a chatbot provider ID. Keep
`app/site.config.ts` as the canonical project config.

## Install And Run

```bash
vp install
vp run dev
```

Validation:

```bash
vp run check
vp test
vp run build
```

Launch readiness:

```bash
vp run check:launch
vp run check:assets
```

`vp run check:launch` must pass for this repository. It rejects placeholder business data and enabled integrations without their required production configuration. `vp run check:assets` fails when a file under
`public/images` no longer has an app, content, or docs owner.

Use `vp check --fix` to apply Oxfmt formatting and safe Oxlint fixes locally.
Use `vp run build`, not `vp build`, in this repo.

## Editor Formatting

VS Code workspace settings pin format-on-save to the Oxc extension
(`oxc.oxc-vscode`). Keep Volar installed for Vue language features, but do not
use Volar as the formatter in this repo.

This Nuxt app intentionally does not keep a root `vite.config.ts`. Nuxt
loads app Vite options from `nuxt.config.ts`, and a root Vite config makes Nuxt
emit a warning during dev and build. Keep Vite+ validation in the explicit
`package.json` scripts instead.

If saving a file formats differently from `vp check --fix`, install the
recommended workspace extensions and reload VS Code.

## Product And Architecture

`app/pages` contains the real page composition roots. Page-only visual sections are colocated under `app/components/pages/<page>`. Stateful capabilities and reusable domain behavior live in `app/features`; cross-site reactive boundaries live in `app/composables`; pure policy and integration helpers live in `app/lib`; and `app/site.config.ts` is the canonical source for business identity and provider configuration.

The reduced campaign layout is part of the same site, not a second application. A visitor who enters through a paid landing page can explore the main site and return to the campaign offer during the same session. The current lead offer is a free 30-minute website clarity conversation, deliberately distinct from the paid Website-Check.

No-tracking projects can leave all optional services disabled; the cookie banner
will stay hidden and no optional analytics script will be registered.

The header locale switcher is configured through `siteConfig.site.localeSwitcher`.
Use `"dropdown"` for the default business-site header and `"segmented"` for
compact two-locale sites. Locale labels and flag icons come from the Nuxt i18n
locale objects; this site uses `circle-flags:de` and `circle-flags:us`.

Built-in analytics support is consent-owned. Plausible, GA4, and GTM stay
disabled in `app/site.config.ts` by default; when a project enables one of
them, `app/components/site/ServiceLoader.vue` loads it through Nuxt Scripts only
after the matching cookie category is accepted. Components still call
`useTracking()` and never provider globals.

## Content Model

Content lives in localized Ginko trees:

- German docs: `content/de/1.dokumentation`
- English docs: `content/en/1.docs`
- German blog: `content/de/2.blog`
- English blog: `content/en/2.blog`
- localized authors: `content/{de,en}/authors`
- localized references/cases: `content/de/7.referenzen`,
  `content/en/7.references`
- German legal pages: `content/de/3.datenschutz.md`, `content/de/4.impressum.md`,
  `content/de/5.agb.md`
- English legal pages: `content/en/3.privacy.md`, `content/en/4.imprint.md`,
  `content/en/5.terms.md`
- optional testimonials: add localized YAML files under `content/{locale}/testimonials`
  only when real client proof is available

The default reference entry owns the sample image set under `public/images`.
Keep it while evaluating optimized figures, galleries, and lightbox behavior.
Delete or replace the reference and its images together for a real client site.

The collection contract lives in `content.config.ts`. Route pages use
`useContentPage()`, lists use `useContentMany()`, navigation uses
`useContentNavigation()`, and rendering passes the full document to
`<ContentRenderer>`.

## Public Surfaces

Docs stay public in this repository as maintainer-facing business documentation.
They explain the reference contract, content model, rendering components, and
business-site conventions. They are not a diagnostics lab and should be deleted
or replaced for client projects that do not want public template documentation.

The Ginko agent surfaces are also intentional defaults:

- `llms.txt` and `llms-full.txt` expose routable, markdown-backed public
  content for AI-aware discovery.
- `/raw/**` exposes canonical Markdown for public docs, blog, services,
  references, and legal pages.
- Search indexes only routable page collections: docs, blog, services, and
  references.

Keep app-only routes such as thank-you pages, optional service internals,
testimonials, FAQs, and local operator files out of those public surfaces.

## Content Components

Generic prose and MDC components live in `packages/content-components` and are
consumed as `@lupinum/content-components`. The module registers prose/MDC
components and provides the reusable `contentComponentTags` map. It does not own
collections, routes, sitemap, prerendering, search, or i18n.

Use the package in Nuxt projects with:

```ts
export default defineNuxtConfig({
  modules: ["@lupinum/content-components"],
});
```

The app keeps project-specific content tags in `nuxt.config.ts`:
`business-contact`, `business-imprint`, `privacy-services`, `consent-embed`, and
`gallery`. If a client project wants full ownership instead of a workspace
dependency, copy `packages/content-components` into that project and adapt it
there.

## Forms

The default form path is deliberately direct: Vue components validate input,
map it to a Basin-compatible payload, and call `submitLeadForm()` from
`app/lib/forms.ts`. `resolveFormEndpoint()` is the single endpoint resolver.
There is no server form adapter in the site.

Configure spam controls in Basin first: enable provider-side spam filtering,
honeypot handling, notification routing, and per-form endpoints. Add a server
route only when the project has a concrete requirement such as high-volume lead
handling, abuse controls, audit logging, Turnstile, attachments, CRM forwarding,
or custom deliverability rules.

## Dependency Ownership

- Nuxt modules: app shell, fonts, icons, image optimization, scripts, i18n,
  sitemap, robots, accessibility, hints, color mode, Ginko Content, and the
  shared content-component module.
- `@nuxt-photo/nuxt`: owned by `MdcGallery` and `PhotoLightbox` for real
  content image sequences.
- `@nuxt/image`: owned by optimized prose, figure, gallery, and public image
  examples.
- `@shikijs/transformers` and `shiki`: owned by Markdown code highlighting.
- `@vueuse/core`, `reka-ui`, `class-variance-authority`, `clsx`,
  `tailwind-merge`, and `zod`: owned by composables, shadcn-vue primitives,
  variant helpers, class merging, and config/content schemas.
- Icon packages: `lucide` for UI/content icons, `circle-flags` for locale
  switching, and `logos` for code/documentation icon examples.

## Typography

The site ships with typography roles wired through Nuxt Fonts and Tailwind
theme tokens:

- `font-heading`: `Pressura Bold`
- `font-body`: `Pressura Light`
- `font-mono`: `JetBrains Mono`
- `font-accent`: `Pressura Medium`

Pressura is served locally from `public/fonts` and registered with explicit
`@font-face` rules in `app/assets/css/tailwind.css`. Change the font families in
`nuxt.config.ts`, and update the fallback stacks in `app/assets/css/tailwind.css`.
