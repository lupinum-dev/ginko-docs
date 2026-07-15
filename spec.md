# Business Website Template Foundation Spec

Status: foundation spec  
Audience: template maintainers, senior engineers, project implementers  
Scope: core architecture, vertical codebase shape, reusable foundations, and feature boundaries  
Out of scope: starter wizards, audits, launch check tooling, generators, visual regression tooling, and cleanup automation

## 1. Purpose

This repository is a reusable Nuxt-based business website template. It should be a strong starting point for client websites that need clean marketing pages, localized content, business-specific configuration, legal pages, forms, optional integrations, SEO, schema output, documentation-style content, and reusable content blocks.

The template should feel complete, but not heavy. It should include the foundations most business websites repeatedly need, while keeping every optional part easy to understand, isolate, customize, and remove.

The goal is not to build a no-code website builder. The goal is to provide a high-quality engineering foundation that lets a developer start from a proven structure and adapt it quickly for a real client.

The foundation should optimize for four things:

1. A new project starts from clear source-of-truth files.
2. Every business feature has an obvious owner in the codebase.
3. Shared abstractions protect important boundaries without hiding normal Nuxt development.
4. The template stays pleasant after multiple client customizations.

## 2. Product and engineering north star

The template should be a vertical business website starter, not a bag of components.

A developer should be able to answer these questions without searching the whole repo:

Where do I change the company facts?  
Where do I change navigation?  
Where do service pages come from?  
Where do legal pages come from?  
Where do optional scripts load?  
Where does form submission happen?  
Where does tracking happen?  
Where do Markdown components live?  
Where can I delete a feature?

The architecture should be boring where possible and opinionated where it protects quality.

Boring means: use Nuxt routing, Vue components, TypeScript, content collections, composables, and plain functions. Do not invent a private framework on top of Nuxt.

Opinionated means: business facts must not be duplicated, content routes must not have multiple owners, provider scripts must not leak into components, legal/service inventory must come from one registry, and generic content components must not know about a specific client business.

## 3. Core principles

### 3.1 Source of truth beats convenience

Repeated facts become bugs. The same company name, contact email, route, service, legal status, or tracking provider must not be copied across unrelated files.

The intended source-of-truth model is:

- Business facts live in `app/site.config.ts`.
- Service and consent inventory is derived in `app/config/service-registry.ts`.
- Routable content lives in `content.config.ts` plus Markdown files under `content/`.
- Static route labels and static localized paths live in i18n route/message files.
- Generic Markdown rendering components live in `packages/content-components`.
- Project-specific Markdown tags live in the app, not in the generic package.

### 3.2 Vertical ownership where it helps

Business features should own their page components, local components, data queries, and page-specific SEO helpers.

Good feature candidates are `home`, `services`, `references`, `blog`, `docs`, `contact`, `legal`, `about`, `chat`, and `search`. Pricing can be added as an optional client feature when real localized pricing data exists.

Shared foundations should stay shared. Do not duplicate consent, tracking, schema, forms transport, URL normalization, or content helper logic inside each feature.

The sweet spot is:

- Route files stay in `app/pages` because Nuxt routing is useful and obvious.
- Page files are thin route entrypoints.
- Feature folders own page components and feature-specific logic.
- Shared app foundations stay in `app/lib`, `app/config`, `app/composables`, and `app/components`.

### 3.3 Abstract only for a reason

Create an abstraction when at least one of these is true:

- The boundary protects privacy, consent, legal, security, or PII handling.
- The implementation has multiple providers now or clearly will soon.
- The same logic is used in at least three places.
- The abstraction makes removal of a feature safer.
- The abstraction improves testability of non-visual logic.

Do not abstract just to make things look enterprise. A direct Vue component with typed props is often better than a generic renderer.

### 3.4 Components should tell the truth

A component named `ServiceCard` should render a service card. It should not fetch content, inspect routes, load analytics providers, or know about legal policy.

A component named `ServicesIndexPage` may query services and compose sections.

A composable named `useTracking` may create and dispatch safe tracking events.

A file named `service-registry.ts` under `config` may derive service registry entries.

Naming should reveal ownership.

### 3.5 Optional features are opt-in by composition

The template can include many features, but optional features must not create hidden global behavior.

A disabled feature may have code in the repo, but it must not:

- load third-party scripts,
- show UI in production unless configured,
- appear in nav unless selected,
- add consent categories unless enabled,
- require env variables unless used,
- make legal pages inaccurate.

This spec does not require feature removal tooling yet. It does require feature boundaries that make later tooling possible.

## 4. Foundation stack

The template foundation uses:

- Nuxt as the application framework.
- Vue as the component model.
- TypeScript for app, config, and package code.
- Zod for runtime validation at important boundaries.
- Tailwind CSS with CSS variables for design tokens.
- shadcn-vue style UI primitives backed by Reka UI where appropriate.
- Ginko Content for typed filesystem content collections.
- Nuxt i18n for localized static routes and messages.
- Nuxt Scripts for optional third-party script loading through a controlled service loader.
- Direct JSON-LD output through `useHead` for structured data.
- Nuxt sitemap and robots modules for generated public output.
- A local `packages/content-components` package for generic Markdown/prose components.

The stack should not become broader without a clear reason. New packages must either remove meaningful custom code, establish a safety boundary, or support a repeated client requirement.

## 5. Target directory structure

The current repo already has most of the right pieces. The foundation should move toward this target shape.

```txt
app/
  app.vue
  error.vue
  site.config.ts

  assets/
    css/
      tailwind.css

  config/
    site.schema.ts
    site.utils.ts
    service-registry.ts
    site.ts
    theme.ts

  components/
    ui/
    site/
    layout/
    sections/
    business/
    mdc/
    shared/

  composables/
    useCanonicalUrl.ts
    useCookieConsent.ts
    useLocalizedPath.ts
    useLocalizedRouteSwitch.ts
    useTracking.ts

  features/
    home/
    services/
    references/
    blog/
    docs/
    contact/
    legal/
    about/
    search/
    chat/
    embeds/

  layouts/
    default.vue
    marketing.vue
    blog.vue
    docs.vue

  lib/
    content/
    consent/
    forms/
    integrations/
    schema/
    seo/
    tracking/
    urls/
    utils.ts

  pages/
    index.vue
    about.vue
    contact.vue
    [...slug].vue
    blog/
    docs/
    references/
    services/

content/
  de/
  en/

packages/
  content-components/

content.config.ts
i18n/
  i18n.config.ts
  routes.ts
nuxt.config.ts
package.json
```

This is a target, not a requirement to move everything immediately. New code should follow this shape. Existing code can be moved gradually when touched.

## 6. Dependency direction

The dependency graph must stay simple.

```txt
pages
  -> features
    -> components/sections, components/business, components/shared
      -> components/ui
    -> lib, config, composables

components/site
  -> config, composables, lib, components/ui

components/mdc
  -> config, composables, lib, components/ui

lib
  -> config only when the helper is explicitly config-bound

packages/content-components
  -> its own runtime components and utilities only
  -> no app config
  -> no app routes
  -> no app content collections
```

Forbidden dependency directions:

- `components/ui` must not import `siteConfig`, i18n, content queries, tracking, or feature code.
- `packages/content-components` must not import app files.
- `config` files must not import Vue composables.
- `lib/tracking` must not import provider globals.
- Feature code must not mutate global service or route registries.
- Page components must not contain provider-specific scripts or endpoint URLs.

## 7. Layer responsibilities

### 7.1 `app/site.config.ts` and `app/config`

`app/site.config.ts` owns project facts.

It is the canonical source for company, site, contact, legal, form, analytics, marketing, chat, embed, and schema facts.

`app/config` owns supporting config code and derived configuration. `site.schema.ts` validates `siteConfig`; `site.utils.ts` contains small helpers for localized text, address formatting, and site URL resolution.

`service-registry.ts` derives the service registry from `siteConfig`. It owns service IDs, service categories, enabled/disabled status, consent requirements, privacy inventory entries, and localized service descriptions.

`site.ts` should own navigation and site-shell configuration if this logic grows beyond the current site config composable. It may derive labels from i18n and paths from `useLocalizedPath`, but static arrays should not be scattered through header, footer, command center, and pages.

`theme.ts` is optional. Use it only if theme customization becomes structured enough to need a TypeScript config. The primary token source remains CSS variables in `tailwind.css`.

Rules:

- Config files should be typed and validated where data enters the app.
- Config files should not import UI components.
- Config files should not call Nuxt composables except in explicitly composable config helpers.
- Environment variable overrides should flow into config, not replace it.
- Client-visible config must not contain secrets.

### 7.2 `app/components/ui`

`ui` contains the primitive design system layer.

These components are wrappers around low-level primitives such as buttons, cards, dialogs, sheets, tabs, accordions, badges, dropdowns, scroll areas, switches, alerts, separators, and keyboard badges.

Rules:

- UI primitives are domain-free.
- UI primitives may use `cn`, `cva`, Tailwind classes, and Reka UI.
- UI primitives must not know about routes, content collections, business config, tracking, forms, consent, or i18n.
- UI primitives expose variants only when variants are reused.
- Do not create a primitive just because a page needs one custom block once.

### 7.3 `app/components/site`

`site` owns the global shell: header, footer, banner, locale switcher, service loader, cookie settings, cookie banner, command/search entrypoint, and global navigation UI.

Rules:

- The shell may read business config and site navigation config.
- The shell may call tracking helpers for navigation events.
- The shell may mount global client-only helpers such as the service loader and command center.
- The shell must not own feature-specific page layout.
- The shell must not hardcode content routes that are owned by content collections.
- Optional global UI must render nothing when disabled.

### 7.4 `app/components/layout`

`layout` contains reusable page shells that are not global layouts.

Examples:

- `DocumentPageShell`
- `ContentPageShell`
- `SplitPageShell`
- `ListingPageShell`

Rules:

- Layout components own structural spacing and landmarks inside a feature page component.
- They should not fetch content.
- They may expose slots for header, aside, body, footer, and CTA areas.
- They should keep repeated spacing and document layout decisions out of feature page components.

### 7.5 `app/components/sections`

`sections` contains reusable marketing and business page sections.

Examples:

- `HeroSimple`
- `HeroSplit`
- `LogoStrip`
- `TrustBar`
- `ServicesGridSection`
- `TestimonialsSection`
- `FaqSection`
- `ContactCtaSection`
- `FeatureGridSection`
- `CaseStudyStripSection`

Rules:

- A section receives data through props.
- A section may emit or call high-level tracking helpers for CTA clicks.
- A section should not fetch content directly unless the section is intentionally data-bound and clearly named that way.
- Sections compose business components and UI primitives.
- Sections are the preferred customization layer for client visual variety.

This is the main foundation improvement over a simple component starter. A client website is usually changed by swapping section variants, not by rewriting the entire page.

### 7.6 `app/components/business`

`business` contains reusable domain objects for business websites.

Examples:

- `ServiceCard`
- `CaseStudyCard`
- `TestimonialCard`
- `SectionHeader`
- `TrustBar`
- `ConsentEmbed`

Rules:

- Business components represent business concepts.
- They are reusable across multiple features.
- They receive business/content data through props.
- They do not own page-level data queries.
- They may call generic tracking helpers only for local interactions.

If a component is only used by one feature and has feature-specific assumptions, keep it in that feature instead.

### 7.7 `app/components/mdc`

`mdc` contains project-specific Markdown component tags.

Examples:

- `MdcBusinessContact`
- `MdcBusinessImprint`
- `MdcPrivacyServices`
- `MdcGallery`
- `MdcConsentEmbed`

Rules:

- App MDC components may read business config when their job is to render project-specific facts.
- App MDC components may read service registry helpers when rendering legal or consent information.
- App MDC components should stay small and explicit.
- Generic prose blocks do not belong here; they belong in `packages/content-components`.

### 7.8 `packages/content-components`

The local content component package owns generic Markdown/prose rendering.

It should include reusable prose and MDC components such as callouts, cards, tabs, accordions, figures, steps, timelines, fields, read-more blocks, code blocks, keyboard badges, and compact prose CSS.

Rules:

- The package registers generic components.
- The package may merge generic Markdown tag mappings.
- The package must not define app content collections.
- The package must not define routes.
- The package must not define sitemap, prerendering, search, i18n, or app navigation.
- The package must not import `siteConfig`.
- The app may override package tags after registering the package.

This boundary is important. It lets the package remain useful across projects without becoming a hidden app layer.

### 7.9 `app/lib`

`lib` owns framework-light logic. Prefer pure functions here.

Suggested subfolders:

```txt
app/lib/
  consent/
    categories.ts
    storage.ts
    version.ts
  content/
    dates.ts
    navigation.ts
    paths.ts
    authors.ts
  forms/
    endpoints.ts
    metadata.ts
    submit.ts
    validation.ts
  integrations/
    service-scripts.ts
  schema/
    site.config.ts
    article.ts
    service.ts
    breadcrumb.ts
  seo/
    meta.ts
    og.ts
    canonical.ts
  tracking/
    events.ts
    dispatch.ts
    providers.ts
  urls/
    internal.ts
    external.ts
  utils.ts
```

The repo does not need this exact split immediately. The rule is more important than the folder count: keep reusable non-visual logic out of Vue components.

Rules:

- `lib` functions should be easy to test without mounting Vue.
- `lib` may import config if the helper is config-bound.
- `lib` should not import components.
- `lib` should not call browser APIs unless guarded.
- Provider-specific code belongs behind adapter-style helpers.

### 7.10 `app/composables`

Composables connect Nuxt/Vue runtime state with app foundations.

Examples:

- `useCanonicalUrl`
- `useLocalizedPath`
- `useLocalizedRouteSwitch`
- `useCookieConsent`
- `useTracking`
- `useScrollspy`
- `useCommandCenter`
- `useDocsNavigation`
- `useChat`

Rules:

- Composables may call Nuxt composables and manage reactive state.
- Composables should delegate pure work to `lib`.
- Composables should expose narrow APIs.
- Use `useState` only for state that truly spans routes/components.
- Use local component state by default.
- Use `useLocalStorage` only for durable client preferences such as consent or recent search items.

### 7.11 `app/features`

`features` is the vertical ownership layer.

A feature owns page components, feature-local components, feature-specific queries, feature-specific SEO helpers, and feature-specific types.

Default feature shape:

```txt
app/features/services/
  components/
    ServiceHero.vue
    ServiceList.vue
    ServiceDetailMeta.vue
  pages/
    ServicesIndexPage.vue
    ServiceDetailPage.vue
  queries.ts
  seo.ts
  schema.ts
  types.ts
  index.ts
```

The Nuxt route file stays thin:

```vue
<script setup lang="ts">
import { ServicesIndexPage } from "@/features/services";

definePageMeta({ layout: "marketing" });
</script>

<template>
  <ServicesIndexPage />
</template>
```

Rules:

- Feature pages may fetch feature data.
- Feature pages may compose sections and business components.
- Feature pages may own page-level SEO and schema registration.
- Feature pages should not load provider scripts directly.
- Feature-local components should stay inside the feature until reused by at least two features.
- `index.ts` should export only the public feature surface.

This is the key vertical foundation. It keeps the repo navigable without turning every small thing into a package.

## 8. Page and feature ownership

### 8.1 Pages

`app/pages` owns routing and route metadata only.

A page file may:

- define page layout,
- import a feature page component,
- pass route params if needed,
- throw a route-level 404 when the feature page component cannot own it cleanly.

A page file should not:

- contain large page templates,
- contain provider-specific integration code,
- contain form endpoint URLs,
- duplicate navigation arrays,
- duplicate collection route definitions,
- hardcode business facts.

Thin pages make feature ownership obvious while preserving Nuxt's file-based routing.

### 8.2 Home feature

The home feature owns the landing page composition.

```txt
app/features/home/
  pages/HomePage.vue
  sections/HomeHeroSection.vue
  queries.ts
  types.ts
```

The home page component may query featured services, testimonials, FAQs, references, and blog posts. It should compose reusable section variants rather than hardcoding every block directly in `app/pages/index.vue`.

Home copy should come from i18n messages for static copy or content collections for content-backed lists.

### 8.3 Services feature

The services feature owns service listings and service detail pages.

Data source: `services` content collection.

Feature responsibilities:

- Query all services for listing pages.
- Query one service by localized route for detail pages.
- Render service cards and detail content.
- Register service schema on detail pages.
- Register breadcrumbs on detail pages.
- Expose a clear CTA path to contact.

The service content schema should include at least:

- `title`
- `description`
- `icon`
- `order`
- `featured`
- `outcome`

Service detail pages should render the full content document through `ContentRenderer`.

### 8.4 References feature

The references feature owns case studies, portfolio items, client stories, or project references.

Data source: `references` content collection.

Feature responsibilities:

- Query all references for listing pages.
- Query one reference by localized route for detail pages.
- Render case study cards.
- Render client, industry, outcome, date, and body content.
- Expose related services or contact CTA where useful.

The reference content schema should include at least:

- `title`
- `description`
- `client`
- `industry`
- `outcome`
- `featured`
- `date`

### 8.5 Blog feature

The blog feature owns article listings and article detail pages.

Data source: `blog` content collection plus `authors` data collection.

Feature responsibilities:

- Query articles sorted by date.
- Populate author references for display.
- Render reading metadata.
- Render article body via `ContentRenderer`.
- Build article table of contents from document body metadata.
- Register article schema and breadcrumbs.
- Suggest related/recent articles.

Author display names should come from the authors collection, not duplicated in article frontmatter.

### 8.6 Docs feature

The docs feature owns documentation pages, sidebar navigation, mobile docs navigation, table of contents, previous/next page navigation, and docs feedback UI.

Data source: `docs` content collection.

Feature responsibilities:

- Query the active docs page.
- Query docs navigation from the content tree.
- Normalize docs navigation for sidebar sections and groups.
- Render the section selector as tabs, a dropdown, or a list from one consumer app-config choice.
- Render full docs documents through `ContentRenderer`.
- Keep folder group metadata in `.navigation.yml` sidecars.
- Use content metadata as navigation metadata.

Docs navigation must not introduce a second frontend route map. When docs content moves, update content files and sidecar metadata.

### 8.7 Contact feature

The contact feature owns contact page content and contact form UI.

Shared form transport remains in `app/lib/forms`.

Feature responsibilities:

- Render business contact facts from `siteConfig`.
- Render contact form UI.
- Validate form inputs before submission.
- Submit through the shared form helper.
- Track form start/success/error through `useTracking` without sending PII.
- Navigate to the localized thank-you page on success.

The contact form should not know about raw provider endpoint URLs. It should call a form helper with a form key such as `contact`.

### 8.8 Legal feature

The legal feature owns privacy, imprint, and terms pages.

Data source: `legal` content collection mounted at localized root routes.

Feature responsibilities:

- Query one legal page by normalized localized path.
- Render legal content through `ContentRenderer`.
- Provide app-specific MDC tags for business contact, imprint facts, and privacy services.
- Keep legal copy in content, not hardcoded page components.
- Avoid duplicate `privacy.vue`, `imprint.vue`, and `terms.vue` route files when the legal collection owns these pages.

Legal content may use app-specific tags like:

```md
::business-imprint
::

::privacy-services
::
```

### 8.9 About feature

The about feature owns company story, values, team, and timeline sections.

Data source: i18n static copy, `siteConfig`, and optionally `authors` or team data collection.

Feature responsibilities:

- Read brand facts from `siteConfig`.
- Read team/author data from content if used.
- Compose reusable section components.
- Avoid hardcoded placeholder team facts in the page component.

### 8.10 Optional Pricing Feature

Pricing is not part of the default business-site route set. Add it only when a
client has real localized pricing data and a clear business reason to publish
it.

The pricing feature should support business-friendly modes:

- hidden,
- custom quote,
- starting-from packages,
- simple packages,
- SaaS tiers.

Pricing copy and numbers should not be buried inside the page template. Use a feature-local config or content collection when pricing is real.

### 8.11 Search and command center feature

Search/command center is a site UX feature, not a developer tool.

Feature responsibilities:

- Search only routable public collections by default.
- Group results by pages, docs, services, references, blog, and actions.
- Track search open, submit, and result click without raw query PII.
- Keep recent items in local storage only if useful.
- Close on route change.

The command center may read navigation and content search, but it should not become the source of navigation truth.

### 8.12 Chat feature

Chat is optional and disabled by default.

Feature responsibilities:

- Render no launcher when disabled.
- Respect service registry and consent category.
- Provide a fallback contact path.
- Keep provider-specific loading behind adapters or service loader hooks.
- Track only safe interaction metadata.
- Never put provider globals in page or section components.

### 8.13 Embeds feature

Embeds include videos, maps, calendars, downloads, and other third-party iframes.

Feature responsibilities:

- Provide a generic consent-gated embed component.
- Support fallback links.
- Track fallback interactions safely.
- Load iframe only when the relevant service category is essential or consented.
- Keep provider descriptions in the service registry.

## 9. Content architecture

Content is a core foundation, not an add-on.

The content model should stay typed, local, static-friendly, and localized.

### 9.1 Collections

`content.config.ts` owns all content collections.

Recommended collections:

```txt
authors       data   i18n   sitemap false
docs          page   i18n   route de /dokumentation, en /docs
blog          page   i18n   route de /blog, en /blog
services      page   i18n   route de /leistungen, en /services
references    page   i18n   route de /referenzen, en /references
legal         page   i18n   route de /, en /
testimonials  data   i18n   sitemap false
faqs          data   i18n   sitemap false
```

Rules:

- Every collection must be strict.
- Every routable collection must define its route base.
- Data-only collections must not be in the sitemap.
- References between collections should use content references, not copied display names.
- Collection schemas should encode the minimum required data for UI and SEO.

### 9.2 Rendering

All Markdown pages should render the full document object:

```vue
<ContentRenderer :value="page" />
```

Do not pass `page.body` to the renderer. The full document is needed for metadata, component context, and table-of-contents behavior.

### 9.3 Content paths

Content file paths may include numeric prefixes for ordering. Public routes should be clean and localized through the content system.

German and English content should have equivalent route ownership. Do not link German docs to English `/docs` paths or English docs to German `/dokumentation` paths.

### 9.4 Content metadata

Use frontmatter for metadata that belongs to content:

- title,
- description,
- icon,
- badge,
- date,
- reading time,
- author reference,
- order,
- outcome,
- client,
- industry,
- legal type.

Do not store business facts in content frontmatter when they belong to `siteConfig`.

### 9.5 Navigation metadata

Docs navigation metadata should live with docs content.

Use `.navigation.yml` sidecars for folder-level metadata such as title, icon, badge, and sidebar behavior.

Use page frontmatter for page-level metadata.

Do not create a second hardcoded docs navigation map in frontend code.

## 10. Business configuration architecture

`app/site.config.ts` is the primary client customization file.

It should contain these sections:

```ts
siteConfig = {
  site: {},
  identity: {},
  contact: {},
  social: {},
  analytics: {},
  marketing: {},
  embeds: {},
  forms: {},
  chat: {},
  legal: {},
  schema: {},
};
```

### 10.1 Site

Owns public site identity:

- localized site name,
- localized site description,
- canonical URL,
- default locale,
- supported locales,
- locale switcher variant,
- logo path.

### 10.2 Identity

Owns legal and business identity:

- legal name,
- brand name,
- organization type,
- country profile,
- VAT ID,
- registry data,
- managing directors,
- founding year.

### 10.3 Contact

Owns canonical contact facts:

- public email,
- privacy email,
- legal email,
- phone,
- postal address.

No component should hardcode these values.

### 10.4 Services and optional providers

Analytics, marketing, embeds, chat, and forms are configured here, but service inventory is derived in `service-registry.ts`.

Every optional provider should have:

- `enabled`,
- provider ID or domain if needed,
- consent category,
- consent mode flag when relevant.

Optional providers default to disabled.

### 10.5 Legal

Owns jurisdiction, last updated date, and responsible person.

Legal pages may render these facts, but final legal text still lives in content.

### 10.6 Schema

Owns organization schema type and served regions.

Schema helpers derive structured data from this section and content data.

## 11. Service, consent, and integration architecture

Service loading is a safety boundary. It deserves a strong abstraction.

### 11.1 Service registry

`app/config/service-registry.ts` owns the derived registry.

Each service entry should include:

```ts
interface ServiceEntry {
  id: string;
  provider: string;
  category: "essential" | "analytics" | "marketing" | "support" | "embeds";
  status: "configured" | "disabled" | "enabled";
  requiresConsent: boolean;
  consentMode?: boolean;
  label: LocalizedText;
  description: LocalizedText;
}
```

Rules:

- Components do not manually maintain service lists.
- Legal/privacy UI reads the service inventory.
- Cookie UI reads derived consent categories.
- Service scripts read derived script load state.
- Optional services require explicit enablement.

### 11.2 Consent categories

Consent categories are derived from enabled services.

Default categories:

- `essential`, always true and not configurable.
- `analytics`, configurable only when an enabled analytics service exists.
- `marketing`, configurable only when an enabled marketing service exists.
- `support`, configurable only when chat/support is enabled.
- `embeds`, configurable only when optional embeds are enabled.

Do not show consent UI just because the codebase supports optional services. Show it only when enabled services require it.

### 11.3 Service loader

The service loader is the only global script loading owner.

Rules:

- Optional scripts load only when service is enabled and consent exists.
- Nuxt Scripts integration belongs behind the service loader.
- Provider handlers register with the tracking dispatcher.
- Components never call provider globals directly.
- Google consent mode starts denied and updates only through consent state.

### 11.4 Tracking facade

`useTracking` is the only public tracking API for UI code.

UI code should call semantic helpers:

```ts
trackCta(location, label, href, variant);
trackNavigation(location, label, href);
trackForm(name, formKey);
trackSearch(name, location);
trackSearchResult(contentType, contentSlug);
trackDownload(contentSlug, label);
trackVideo(name, contentSlug, step);
trackChat(name, props);
```

Tracking events must be sanitized before dispatch.

Forbidden tracking data:

- email,
- phone,
- full names,
- message text,
- raw search query,
- arbitrary form payload,
- unknown provider-specific fields.

The tracking event dictionary should stay small and business-oriented.

### 11.5 Provider adapters

Provider adapters may exist for:

- Plausible,
- GA4,
- GTM,
- Meta Pixel,
- LinkedIn Insight,
- chat providers,
- embed providers.

Adapters are allowed to know provider APIs. UI components are not.

## 12. Form architecture

Forms are core for business websites.

The foundation should support a small number of high-quality form patterns instead of many half-finished forms.

Default forms:

- contact form,
- lead magnet form.

Optional later forms:

- newsletter form,
- booking request form,
- quote request form,
- support request form.

### 12.1 Form ownership

Feature form UI lives in the feature that owns the user journey.

Shared form transport and validation helpers live in `app/lib/forms`.

Recommended split:

```txt
app/features/contact/components/ContactForm.vue
app/features/contact/pages/ContactPage.vue

app/features/lead-magnet/components/LeadMagnetForm.vue

app/lib/forms/endpoints.ts
app/lib/forms/metadata.ts
app/lib/forms/submit.ts
app/lib/forms/validation.ts
```

The repo may keep a flatter `app/lib/forms.ts` while the logic is small. Split only when the file becomes harder to scan.

### 12.2 Endpoint resolution

Forms submit by form key.

```ts
submitLeadForm("contact", payload, options);
```

The form key resolves to a provider endpoint through config. Vue components must not contain raw provider endpoint URLs.

Development and test may use a test endpoint. Production must use explicit production endpoints.

### 12.3 Form payloads

Payload mapping should be explicit.

UI form state can use frontend-friendly names:

```ts
privacyAccepted;
resourceId;
```

Submitted payloads can map to provider-friendly names:

```ts
privacy_accepted;
resource_id;
```

Metadata should include:

- form key,
- locale,
- source path,
- submitted timestamp,
- consent version,
- site domain,
- optional UTM values.

### 12.4 Spam protection

The default foundation should include a honeypot field.

More advanced spam protection, such as Turnstile or server-side rate limiting, should be provider adapters or project-specific additions.

### 12.5 Accessibility

Forms must have:

- labels,
- autocomplete attributes where appropriate,
- `aria-invalid`,
- `aria-describedby` for errors,
- clear success and error states,
- privacy consent link,
- disabled submitting state.

## 13. i18n and route architecture

The app supports German and English by default.

### 13.1 Static routes

Static route keys live in `i18n/routes.ts` and are used through `useLocalizedPath`.

Examples:

- home,
- about,
- contact,
- thank-you.

Rules:

- Static routes belong to i18n route config.
- Feature components should use route keys, not hardcoded localized paths.
- Add route keys only for app-owned static pages.

### 13.2 Content routes

Content routes belong to `content.config.ts`.

Examples:

- docs,
- blog articles,
- services,
- references,
- legal pages.

Rules:

- Do not duplicate content routes in static route maps except collection roots that also appear in navigation.
- Do not hardcode content slug mappings in locale switchers.
- Use content variants or content locale paths for equivalent translated pages.

### 13.3 Locale switcher

The locale switcher should ask the route/content layer for the equivalent target path.

Priority:

1. Active content page `localePaths`.
2. Content variants for collections such as services, references, and legal pages.
3. Content-aware locale switch path.
4. Static i18n switch path fallback.

The locale switcher must preserve route intent. Switching language on a service page should land on the translated service page when it exists, not just the target locale homepage.

## 14. SEO and schema architecture

SEO is a foundation, not a final checklist.

### 14.1 Global metadata

`app.vue` owns global metadata that applies everywhere:

- canonical base behavior,
- default OG image,
- Twitter card default,
- html `lang`,
- alternate language links,
- organization/site schema.

Global metadata must derive from route, runtime site URL, i18n locale, and business config.

### 14.2 Page metadata

Each feature page component owns page-level metadata because it already has the source data.

Examples:

- service detail screen owns service title, description, breadcrumb schema, and service schema.
- blog detail screen owns article title, description, author, date, article schema, and breadcrumbs.
- legal screen owns legal page title and description.

Do not create a separate metadata registry that duplicates content.

### 14.3 Schema helpers

Schema helpers live in `app/lib/schema` or `app/lib/schema-org.ts` while small.

Helpers should be pure and config-driven.

Core helpers:

- `createBusinessIdentitySchema`
- `createWebSiteSchema`
- `createBreadcrumbSchema`
- `createServiceSchema`
- `createArticleSchema`
- `createFaqSchema`

Do not add review or rating schema unless the project has real, compliant review data.

### 14.4 OG images

The foundation should have one default OG image fallback.

Content pages may override it with frontmatter later, but the default path should be stable and branded.

Do not require dynamic OG generation in the core foundation unless a real project needs it.

## 15. Styling and design system foundation

The visual foundation should be token-first.

### 15.1 CSS variables

`app/assets/css/tailwind.css` owns semantic tokens:

- colors,
- foreground/background pairs,
- cards,
- popovers,
- primary/secondary/accent/muted/destructive,
- borders,
- inputs,
- rings,
- chart colors,
- radius,
- fonts,
- docs layout dimensions.

Components should use semantic classes such as `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, and `bg-card`.

Avoid raw color classes in app components unless a specific semantic exception is justified.

Shared page layout helpers live in the same stylesheet:

- `site-container` for the main content width and horizontal padding,
- `site-section` for standard vertical section rhythm,
- `site-section-hero` for larger first-section spacing,
- `site-card` and `site-card-interactive` for repeated site cards.

### 15.2 Typography

Fonts are exposed through CSS variables:

- `--font-body`,
- `--font-heading`,
- `--font-mono`,
- `--font-accent`.

Typography utilities should map to those variables.

The content prose package owns content rhythm. Page sections own marketing typography.

### 15.3 Component variants

Use `cva` for primitive variants that repeat.

Good variant candidates:

- button variants,
- badge variants,
- card variants,
- alert variants,
- dialog size variants.

Bad variant candidates:

- one-off page-specific styles,
- client-specific art direction,
- variants used once.

### 15.4 Section variants

Section variants are the main customization mechanism for client websites.

Prefer:

```txt
HeroSimple.vue
HeroSplit.vue
HeroCentered.vue
ServicesGridSection.vue
ServicesListSection.vue
ProofTestimonialsSection.vue
ContactCtaSection.vue
```

Avoid a giant universal `SectionRenderer` until there is a real need for content-managed page composition.

### 15.5 Motion

Motion should be subtle and respect reduced motion.

Global CSS must disable or minimize transitions and animations under `prefers-reduced-motion: reduce`.

Marketing decoration should not harm readability, contrast, or performance.

## 16. Accessibility foundation

Accessibility belongs in architecture.

Rules:

- The site shell provides a skip link.
- Every rendered route has exactly one main landmark.
- Layouts own main landmarks; pages should not add their own unless they intentionally own a special shell.
- Docs layout delegates the main landmark to docs page content when the docs shell requires it.
- Dialogs, sheets, dropdowns, tabs, accordions, and scroll areas should use accessible primitives.
- All interactive elements must have visible focus states.
- Icon-only buttons must have accessible labels.
- Form errors must be programmatically associated with inputs.
- Reduced motion must be respected globally.
- Content images require meaningful alt text unless decorative.

Do not trade accessibility for decorative marketing effects.

## 17. Performance and rendering foundation

The template should be static-generation friendly by default.

Rules:

- Avoid unnecessary client-only wrappers.
- Use `ClientOnly` for service loader, command center, chat launcher, or components that truly require browser APIs.
- Guard browser APIs with `import.meta.client`.
- Use content queries that work during SSR/generation.
- Throw proper 404s for missing content on the server.
- Keep optional scripts disabled until configured and consented.
- Use lazy loading for images and iframes.
- Prefer semantic HTML and CSS over heavy client-side layout logic.

Large interactive features should be optional and isolated.

## 18. Local package and module strategy

The repo should use local packages and modules intentionally.

### 18.1 Packages

Use packages for reusable code that can survive outside one app.

Good package candidates:

- generic content/prose components,
- generic utilities with no app dependency,
- reusable Nuxt modules that provide app-agnostic behavior.

Bad package candidates:

- client-specific sections,
- business-specific content,
- app navigation,
- service registry tied to one business config,
- legal content,
- route ownership.

### 18.2 Local Nuxt modules

Use local Nuxt modules only for build/framework wiring.

Good module candidates later:

- content component registration,
- local Markdown plugins,
- feature auto-registration if tooling is added later,
- design token generation if theme config becomes real.

Do not create a Nuxt module for normal app feature code.

### 18.3 Plugins

Use Nuxt plugins only for runtime injection or behavior that must run during Nuxt plugin lifecycle.

Do not use plugins as dumping grounds for global state.

## 19. Server and client boundaries

Nuxt apps can accidentally leak server assumptions into the browser or browser assumptions into SSR.

Rules:

- Server-only values must not be placed in public runtime config.
- Browser APIs must be guarded.
- Third-party provider globals must be hidden behind client-only adapters.
- Static generation must not depend on runtime-only APIs for public pages.
- Content queries for public pages must work during prerendering.
- Env values may configure providers, but business config remains the canonical structure.

## 20. Error and fallback architecture

The template needs good failure behavior by default.

Rules:

- Missing content detail pages throw 404 on the server.
- The error page uses the normal site shell.
- 404 copy is localized.
- Contact fallback paths exist when optional chat or embeds are unavailable.
- Disabled features render nothing or a clear fallback, not broken UI.
- Legal and contact pages should still work without optional tracking, chat, or embeds.

## 21. Naming conventions

Naming should expose ownership and intent.

### 21.1 Components

Use domain or feature prefixes where helpful:

```txt
ServiceCard.vue
CaseStudyCard.vue
DocsSidebar.vue
DocsToc.vue
ContactForm.vue
LegalContentPage.vue
SiteHeader.vue
SiteFooter.vue
```

Use `Section` suffix for reusable page sections:

```txt
HeroSection.vue
FaqSection.vue
TestimonialsSection.vue
ContactCtaSection.vue
```

Use `Page` suffix for feature-level route page components:

```txt
ServicesIndexPage.vue
ServiceDetailPage.vue
BlogDetailPage.vue
ContactPage.vue
```

### 21.2 Functions

Use consistent verbs:

- `createX` for constructing new values.
- `resolveX` for deriving a concrete value from config/context.
- `normalizeX` for making input safe/canonical.
- `formatX` for display formatting.
- `getX` for pure retrieval/derivation.
- `useX` for Vue/Nuxt composables.
- `trackX` for tracking helper wrappers.
- `submitX` for side-effectful submissions.

### 21.3 Files

Keep feature files boring:

```txt
queries.ts
seo.ts
schema.ts
types.ts
index.ts
```

Avoid vague names like `helpers.ts`, `misc.ts`, `common.ts`, or `stuff.ts`.

## 22. Import conventions

Use aliases for app imports:

```ts
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/site.config";
import { createArticleSchema } from "@/lib/schema-org";
```

Use relative imports inside small local folders when it improves readability:

```ts
import DocsToc from "./DocsToc.vue";
```

Feature public imports should go through the feature barrel only when that makes the page file cleaner:

```ts
import { ServicesIndexPage } from "@/features/services";
```

Avoid deep feature imports from unrelated features.

## 23. Data fetching conventions

Feature page components or route entrypoints fetch data. Leaf components receive props.

Good:

```vue
<script setup lang="ts">
const { data: services } = await useContentMany("services", {
  locale: () => locale.value,
  fallback: true,
  sort: { order: "asc" },
});
</script>

<template>
  <ServicesGridSection :services="services" />
</template>
```

Bad:

```vue
<ServiceCard />
```

where `ServiceCard` secretly queries global content.

Rules:

- Lists query in listing pages.
- Detail pages query by route.
- Components stay prop-driven unless their name clearly states they are data-bound.
- Content references should be populated at the query boundary.

## 24. Feature public API pattern

Every feature may expose a small public API.

```ts
// app/features/services/index.ts
export { default as ServicesIndexPage } from "./pages/ServicesIndexPage.vue";
export { default as ServiceDetailPage } from "./pages/ServiceDetailPage.vue";
export type { ServiceSummary } from "./types";
```

Do not export every internal component. Export what pages or other features are allowed to use.

## 25. Recommended feature folder specs

### 25.1 `app/features/services`

```txt
services/
  components/
    ServiceDetailHeader.vue
    ServiceMetaList.vue
  pages/
    ServicesIndexPage.vue
    ServiceDetailPage.vue
  queries.ts
  schema.ts
  types.ts
  index.ts
```

`queries.ts` owns content query options and mapping helpers.  
`schema.ts` owns service schema integration helpers if they become feature-specific.  
`types.ts` owns local public types.

### 25.2 `app/features/references`

```txt
references/
  components/
    ReferenceDetailHeader.vue
    ReferenceFacts.vue
  pages/
    ReferencesIndexPage.vue
    ReferenceDetailPage.vue
  queries.ts
  types.ts
  index.ts
```

### 25.3 `app/features/blog`

```txt
blog/
  components/
    BlogArticleCard.vue
    BlogArticleHeader.vue
    BlogSuggestions.vue
  pages/
    BlogIndexPage.vue
    BlogDetailPage.vue
  queries.ts
  schema.ts
  types.ts
  index.ts
```

### 25.4 `app/features/docs`

```txt
docs/
  components/
    DocsAskAi.vue
    DocsMobileToc.vue
    DocsPageContent.vue
    DocsPageNav.vue
    DocsSidebar.vue
    DocsSidebarDropdown.vue
    DocsSidebarItem.vue
    DocsSidebarList.vue
    DocsSidebarTabs.vue
    DocsToc.vue
  composables/
    useDocsNavigation.ts
  lib/
    navigation.ts
    toc.ts
  pages/
    DocsDetailPage.vue
  types.ts
  index.ts
```

Docs is large enough to justify local subfolders.

### 25.5 `app/features/contact`

```txt
contact/
  components/
    ContactForm.vue
    ContactDetails.vue
  pages/
    ContactPage.vue
    ThankYouPage.vue
  validation.ts
  types.ts
  index.ts
```

Shared form submission remains in `app/lib/forms`.

### 25.6 `app/features/legal`

```txt
legal/
  components/
    LegalContentPage.vue
  pages/
    LegalContentPage.vue
  queries.ts
  types.ts
  index.ts
```

Project-specific legal MDC tags stay in `app/components/mdc` because they are rendered by content globally.

### 25.7 `app/features/search`

```txt
search/
  components/
    CommandCenter.vue
    CommandCenterGroup.vue
    CommandCenterItem.vue
  composables/
    useCommandCenter.ts
  types.ts
  index.ts
```

### 25.8 `app/features/chat`

```txt
chat/
  components/
    ChatLauncher.vue
    ChatConsentGate.vue
  composables/
    useChat.ts
  providers/
    brevo.ts
    crisp.ts
    hubspot.ts
    custom.ts
  types.ts
  index.ts
```

Provider files should only be added when implemented. Do not add fake adapters.

## 26. Route ownership matrix

```txt
/                         app/pages/index.vue -> home feature
/en                       app/pages/index.vue -> home feature
/kontakt                  app/pages/contact.vue -> contact feature
/en/contact               app/pages/contact.vue -> contact feature
/danke                    app/pages/thank-you.vue -> contact feature
/en/thank-you             app/pages/thank-you.vue -> contact feature
/ueber-uns                app/pages/about.vue -> about feature
/en/about                 app/pages/about.vue -> about feature
/dokumentation/**         docs content collection -> docs feature
/en/docs/**               docs content collection -> docs feature
/blog/**                  blog content collection -> blog feature
/en/blog/**               blog content collection -> blog feature
/leistungen/**            services content collection -> services feature
/en/services/**           services content collection -> services feature
/referenzen/**            references content collection -> references feature
/en/references/**         references content collection -> references feature
/datenschutz              legal content collection -> legal feature
/en/privacy               legal content collection -> legal feature
/impressum                legal content collection -> legal feature
/en/imprint               legal content collection -> legal feature
/agb                      legal content collection -> legal feature
/en/terms                 legal content collection -> legal feature
```

When route ownership is unclear, prefer the owner that already owns the source data.

## 27. Markdown component architecture

Markdown rendering has two layers.

### 27.1 Generic layer

`packages/content-components` owns generic tags:

```txt
accordion
accordion-item
alert
aside
callout
card
card-group
center
column
doc-img
dropcap
field
field-group
figure
idea
info
layout
note
passage
quiz
read-more
shortcut
steps
tabs
timeline
warning
```

These tags should be useful in docs, blog, legal pages, and project content without knowing the client.

### 27.2 App-specific layer

`app/components/mdc` owns business-specific tags:

```txt
business-contact
business-imprint
privacy-services
consent-embed
gallery
```

These tags may depend on app config, services, and business-specific behavior.

### 27.3 Tag registration

The app registers the package and merges its generic tags. The app may then add or override project-specific tags.

Package tags should not win over app tags when the app intentionally overrides a tag.

## 28. Privacy and legal foundation

The foundation should make privacy-relevant behavior explicit.

Rules:

- No optional service loads by default.
- No cookie banner appears unless enabled services require consent.
- Privacy service table derives from the service registry.
- Legal content can render service inventory through `::privacy-services`.
- Provider descriptions are localized in the service registry.
- Forms are essential only for actively submitted form requests.
- Tracking must not collect PII.

The template should never imply that legal placeholder text is final legal advice. That warning belongs in docs/handoff later, not in public legal pages.

## 29. What belongs in config versus content versus i18n

Use this rule of thumb.

Config owns facts the app needs to behave correctly:

- company identity,
- contact details,
- service enablement,
- provider IDs,
- legal jurisdiction metadata,
- schema type,
- served regions,
- form endpoints.

Content owns editorial material:

- service page body,
- reference page body,
- blog article body,
- docs body,
- legal text,
- testimonials,
- FAQs,
- author bios.

I18n owns static interface text:

- nav labels,
- button labels,
- form field labels,
- error messages,
- route labels,
- page copy for static pages when not content-backed.

Do not put long editorial copy in `siteConfig`. Do not put provider IDs in content. Do not put business address strings in i18n messages.

## 30. Current structure compatibility

The current codebase may keep these folders while migrating gradually:

```txt
app/components/business
app/components/marketing
app/components/forms
app/components/docs
app/composables
app/lib
```

The target structure does not require moving every existing file immediately.

Recommended gradual migration:

1. Keep `components/ui`, `components/mdc`, and `packages/content-components` as-is.
2. Move new page-level work into `app/features/*`.
3. When editing a page heavily, extract its screen into the matching feature.
4. When a business/marketing component becomes reusable across features, move it to `components/sections` or `components/business`.
5. When a component remains feature-specific, keep it in the feature.
6. Split large `lib/*.ts` files only when they become hard to scan.

Avoid churn for its own sake.

## 31. Non-goals for the foundation

Do not build these into the foundation yet:

- a full starter CLI,
- launch score automation,
- placeholder detection automation,
- visual regression infrastructure,
- a CMS abstraction layer,
- a JSON page builder,
- a feature manifest system,
- a full plugin marketplace,
- a generic legal document generator,
- a universal form builder,
- custom router abstractions over Nuxt pages.

These can come later. The foundation should make them possible without requiring them now.

## 32. Quality bar for new foundation code

New foundation code should satisfy these rules:

- It has one clear owner folder.
- It has a narrow public API.
- It does not duplicate a known source of truth.
- It does not introduce provider globals into UI components.
- It does not make optional features globally active by accident.
- It is SSR-safe or explicitly client-only.
- It uses semantic design tokens.
- It is accessible by default.
- It does not hide normal Nuxt behavior behind unnecessary framework code.
- It can be deleted or replaced without surprising unrelated features.

## 33. Example: ideal service detail flow

Route file:

```vue
<!-- app/pages/services/[...slug].vue -->
<script setup lang="ts">
import { ServiceDetailPage } from "@/features/services";

definePageMeta({ layout: "default" });
</script>

<template>
  <ServiceDetailPage />
</template>
```

Feature page component:

```vue
<!-- app/features/services/pages/ServiceDetailPage.vue -->
<script setup lang="ts">
import { createBreadcrumbSchema, createServiceSchema } from "@/lib/schema-org";
import { getServiceByRoute } from "../queries";

const route = useRoute();
const { t } = useI18n();
const localizedPath = useLocalizedPath();
const canonicalUrl = useCanonicalUrl();
const service = await getServiceByRoute(route.path);

if (import.meta.server && !service.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

useSeoMeta({
  title: computed(
    () => `${service.value?.title ?? t("pages.services.fallbackTitle")} - ${t("site.name")}`,
  ),
  description: computed(
    () => service.value?.description ?? t("pages.services.fallbackDescription"),
  ),
  ogUrl: canonicalUrl,
});

useSchemaJsonLd(() =>
  service.value
    ? [
        createBreadcrumbSchema([
          { name: t("nav.services"), path: localizedPath("services") },
          { name: service.value.title, path: service.value.path },
        ]),
        createServiceSchema(service.value, canonicalUrl.value),
      ]
    : [],
);
</script>

<template>
  <LayoutDocumentPageShell>
    <ServiceDetailHeader v-if="service" :service="service" />
    <div v-if="service" class="content-prose">
      <ContentRenderer :value="service" />
    </div>
  </LayoutDocumentPageShell>
</template>
```

Query helper:

```ts
// app/features/services/queries.ts
export async function getServiceByRoute(path: string) {
  const routeLocale = computed(() => localeFromRoutePath(path));

  const { data } = await useContentOne("services", {
    locale: () => routeLocale.value,
    fallback: true,
    by: { route: () => path },
  });

  return data;
}
```

This keeps routing visible, feature logic vertical, content ownership intact, and schema close to the data source.

## 34. Example: ideal optional integration flow

Business config enables a provider:

```ts
analytics: {
  plausible: {
    enabled: true,
    consentCategory: 'analytics',
    domain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN,
  },
}
```

Service registry derives status and consent:

```ts
{
  id: 'analytics.plausible',
  provider: 'plausible',
  category: 'analytics',
  status: 'enabled',
  requiresConsent: true,
}
```

Cookie UI derives categories from enabled services.

Service loader checks enabled + consented state.

Tracking provider registers with dispatcher.

Components continue to call:

```ts
trackCta("hero", "Book a call", "/kontakt", "primary");
```

No page, section, or card component knows that Plausible is the active provider.

## 35. Final architectural stance

The template should feel like a serious production starter because the foundations are clear:

- Business facts are centralized.
- Content is typed and route-aware.
- Static and content routes have separate owners.
- UI primitives are domain-free.
- Sections are the main customization surface.
- Features are vertical where it improves navigation and deletion.
- Provider integrations are behind consent-aware adapters.
- Forms are provider-resolved, not endpoint-hardcoded.
- Tracking is semantic and sanitized.
- Legal and privacy rendering is service-registry driven.
- Markdown components are split into generic package tags and project-specific app tags.
- Accessibility and performance are built into the shell and primitives.

This is the sweet spot: enough abstraction to protect the repeated hard parts, not so much abstraction that a normal Nuxt developer has to learn a private framework before changing a client site.
