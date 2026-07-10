# Lupinum Architecture Refactor Plan

Status: implemented and verified on 2026-07-10
Scope: architecture, ownership, composables, search, content, integrations, tests, and repository workflow  
Product horizon: a large multilingual business website maintained for many years and used as a reference architecture for future agency projects

Final verification: `vp run check`, `vp test` (114 tests), `vp run check:assets`, `vp run check:launch`, and `vp run build` pass. Browser verification covers German and English marketing/content routes, search and highlighting, campaign handoff/return/dismissal, form validation, accessibility/runtime diagnostics, and 375 px responsive behavior without hydration errors or horizontal overflow.

## 1. Updated premise

This is not intended to become a small agency brochure site.

The planned product includes:

- a substantial marketing website;
- a blog and editorial system;
- service and reference/case-study sections;
- a large information area with wiki- and documentation-style content;
- full-text search and command-palette navigation;
- conversion-focused advertising landing pages with a reduced-distraction shell;
- a clear journey from an ad landing page into the full site and back to the campaign offer;
- multilingual routes and content;
- reusable rich-content components;
- consent-aware integrations, structured data, forms, and tracking;
- patterns that can be proven here and reused in later business websites.

That context changes the review materially. The docs feature, search system, content-component package, content collections, and integration foundations are not automatically overengineering. They are justified capabilities. The refactor should make those capabilities easier to own; it should not delete them simply because some currently contain placeholder data.

The repository should be treated as a **flagship site and reference implementation**, not as a generic website builder:

- Lupinum-specific copy, routes, enabled services, and page composition belong to this app.
- Reusable rendering capabilities may live in packages when they have a stable contract.
- Reusable architectural patterns may be copied into later projects.
- The app should not retain competing implementations or speculative feature branches merely to demonstrate flexibility.
- Placeholder content is acceptable during development, but it must be visibly classified and must not become a second permanent product identity.

## 2. Executive recommendation

The current foundation is stronger than a minimal-site review suggests. The domain-feature direction, content collections, i18n registry, pure `lib` functions, Nuxt route boundaries, structured-data helpers, and content-component boundary are appropriate for the planned scale.

The refactor should therefore be a **targeted structural hardening**, not a simplification into flat pages:

1. Restore a trustworthy green baseline.
2. Establish one owner for routes, identity, canonical origins, content, integration metadata, and search taxonomy.
3. Make search a first-class feature and split its pure relevance logic from Vue orchestration.
4. Make Nuxt route files the actual page composition roots and colocate page-only sections under `components/pages/<page>`.
5. Reserve `features` for stateful capabilities and content domains rather than duplicating every route as a `*Page.vue` wrapper.
6. Add a campaign landing-page shell and session-scoped campaign continuity without creating a second site.
7. Keep only truly cross-feature foundations in `app/composables`, `app/lib`, and shared component folders.
8. Preserve the content-component package, but remove the mandatory package-build tax from ordinary app development if source consumption is reliable.
9. Replace source-text tests with behavior, contract, policy, and generated-output tests.
10. Convert placeholder inventory into real Lupinum content incrementally without deleting required capabilities.

The desired result is not the fewest possible files. It is the fewest concepts and ownership rules needed for a genuinely large site.

## 3. How the external review should be interpreted

### Feedback to accept

- The repository currently has failing quality gates.
- The hardcoded `/kontakt` link is a real production build defect.
- Canonical URL resolution has more than one path.
- Route data, identity values, and integration metadata have duplicate representations.
- `useCommandCenter.ts` owns too many responsibilities for a central, high-value subsystem.
- Several global composables are actually feature-specific.
- Many tests assert source strings, filenames, imports, or CSS classes instead of behavior.
- One-line feature barrels currently provide little value.
- `tm(...) as SomeType[]` moves rich message data across an unchecked type boundary.
- The content package is rebuilt more often than its package boundary should require.
- Commented-out UI and genuinely unowned files should not remain indefinitely.

### Feedback to reject under the clarified requirements

- Do not delete the docs/wiki feature. It is a planned product surface.
- Do not replace full search with a tiny ten-page-site search modal. Search must scale with the content corpus.
- Do not delete the rich MDC catalog merely because placeholder content has not exercised every block yet.
- Do not flatten stateful capabilities and content domains into route files. Route files should still be the proper page composition roots.
- Do not remove consent and integration architecture simply because all providers are currently disabled. The repeatable business-site requirement justifies a supported capability catalog.
- Do not treat all placeholder content as architectural evidence. Content replacement and code structure are separate workstreams.

### Feedback to modify

- Keep the content package boundary, but make daily development consume source without rebuilding the package when possible.
- Keep the integration catalog, but make it the canonical catalog used by consent, scripts, privacy inventory, launch checks, and tests.
- Replace duplicate feature `*Page.vue` wrappers with page-centric route composition and page-owned section folders.
- Keep a small number of architecture-policy checks, but move them out of brittle per-file substring tests.

## 4. Pre-refactor validation baseline

The following results were verified before writing this plan:

| Command               | Current result                                               | Required action                                                             |
| --------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `vp install`          | Passes                                                       | Keep                                                                        |
| `vp run check`        | Fails with five `possibly undefined` errors in home sections | Fix data modeling rather than add non-null assertions                       |
| `vp test`             | 104/106 pass                                                 | Update two stale starter-branding assertions                                |
| `vp run check:assets` | Reports four unreferenced images                             | Assign an owner or delete each file                                         |
| `vp run check:launch` | Cannot run because `jiti` is unavailable                     | Make the check directly executable with an installed/runtime-supported tool |
| `vp run build`        | Fails while prerendering `/kontakt`                          | Use the canonical localized route helper                                    |

The CI workflow also expects the launch check to fail while placeholders remain. That is useful for an untouched starter but wrong for a flagship site: CI must eventually reward launch readiness, not reject it.

No architecture refactor should begin before the repository has a trustworthy baseline. Red checks caused by stale expectations hide new regressions.

## 5. Architecture decisions

### 5.1 Repository identity

This repository owns the Lupinum website. It also demonstrates reusable patterns, but it is not itself a generic runtime-configurable product.

Consequences:

- `package.json`, public metadata, generated agent output, structured data, and CI should identify Lupinum.
- Placeholder content may remain temporarily, but tests must not require placeholders to remain.
- Reusable code must have a named contract: an app-level feature slice or a package.
- Reuse does not justify maintaining old and new app implementations side by side.

### 5.2 Dependency direction

The intended dependency flow is:

```text
pages -> page-owned sections
      -> domain features
      -> shared components/ui
      -> app composables/lib/config

domain features -> shared components/ui
                -> app composables/lib/config

site shell -> shared components/ui
           -> app composables/lib/config

content collections -> content schemas/config
content rendering   -> content-components package

content-components package -> its own runtime and declared peers only
```

Forbidden directions:

- global composables importing feature internals;
- UI primitives importing site config, content, routes, tracking, or features;
- generic content components importing Lupinum business config;
- config importing Vue composables;
- route files containing provider integration logic or reusable domain behavior;
- search manually duplicating navigation and content ownership that already exists elsewhere.

### 5.3 Colocation rule

Colocation follows ownership, not file type.

- Used by one page and primarily visual: keep it under `components/pages/<page>`.
- Used by one feature: keep it inside that feature.
- Used by multiple features but owned by one domain: keep it with the owner and expose a deliberate API.
- Truly cross-feature and domain-neutral: move it to an app-level shared folder.
- Pure and domain-specific: keep it in the feature as a plain module, not a global composable.
- Reactive/lifecycle behavior shared across the app: an app-level composable is appropriate.

There is no mandatory “third consumer” law. Consumer count is evidence, not the only criterion. Privacy, URL, schema, and tracking boundaries can justify sharing earlier because they protect important invariants.

## 6. Target directory structure

```text
app/
  app.vue
  error.vue
  site.config.ts

  assets/
    css/

  components/
    ui/                         # domain-free primitives actually supported by the app
    site/                       # header, footer, logo, banner, locale/theme controls
    marketing/                  # genuinely cross-page marketing components
    content/                    # shared document shell, feedback, copy tools, gallery UI
    pages/                      # visual sections owned by exactly one page
      home/
        HomeHeroSection.vue
        HomeAudienceSection.vue
        HomeSolutionSection.vue
        HomeProofSection.vue
        HomeCtaSection.vue
      about/
      contact/
      campaigns/
        website-clarity/
          WebsiteClarityHeroSection.vue
          WebsiteClarityOutcomesSection.vue
          WebsiteClarityProcessSection.vue
          WebsiteClarityFormSection.vue

  composables/                  # cross-feature reactive/lifecycle boundaries only
    useCanonicalUrl.ts
    useCookieConsent.ts
    useLocalizedPath.ts
    useLocalizedRouteSwitch.ts
    useSchemaJsonLd.ts
    useSiteNavigation.ts
    useTracking.ts

  config/
    site.schema.ts
    site.utils.ts
    service-registry.ts

  features/                     # reusable behavior or domain knowledge, not page mirrors
    blog/
      components/
      getBlogAuthors.ts

    campaign-context/           # active paid-landing journey across layouts
      components/
        CampaignReturnBar.vue
      campaign-context.ts
      useCampaignContext.ts
      campaign-context.test.ts

    contact-form/
      components/
      contact-form.ts

    docs/
      components/
      composables/
      docs-navigation.ts

    references/
      components/

    search/
      components/
        SearchDialog.vue
        SearchPageHighlight.vue
      command-center.ts         # pure ranking/grouping/storage contracts
      command-center.test.ts
      useCommandCenter.ts       # Nuxt/Vue orchestration

    services/
      components/

    chat/                       # keep only if chat is on the product roadmap
      components/
      useChat.ts

  layouts/
    default.vue                 # complete site shell
    docs.vue                    # documentation shell when meaningfully different
    campaign.vue                # reduced-distraction shell, same brand and app

  lib/
    consent.ts
    errors.ts
    forms.ts
    schema-org.ts
    seo.ts
    tracking/

  pages/                        # actual page composition roots
    index.vue
    about.vue
    contact.vue
    thank-you.vue
    blog/
      index.vue
      [slug].vue
    services/
      index.vue
      [slug].vue
    references/
      index.vue
      [slug].vue
    docs/
      [...slug].vue
    campaigns/
      website-clarity.vue

content/
  de/
  en/

i18n/
  messages/global/             # application chrome and reusable UI language
  locales.ts
  routes.ts

packages/
  content-components/          # reusable prose/MDC Nuxt module
```

This structure intentionally retains `pages`, `features`, `content`, `i18n`, and the local package. It removes categories that obscure ownership:

- `components/business` is too vague; reusable sections should become `components/marketing`, while page-specific sections stay under `components/pages`.
- `features/content` currently contains shared rendering UI, not a user-facing capability; it belongs under `components/content` unless it grows real content-workflow behavior.
- `components/media/PhotoLightbox.vue` belongs next to the gallery capability that owns it.
- `ModeToggle.vue` belongs with the site shell.

### Pages are composition roots, not pass-through shells

Keep Nuxt filesystem routing, but make each `app/pages` file the truthful page root. A route file should normally own:

- `definePageMeta`, layout selection, SEO, and structured page metadata;
- page-level content queries and loading/error states;
- the ordered composition of page sections;
- wiring between the route, domain features, and page-owned visual sections.

Do not create `features/home/HomePage.vue` or `features/about/AboutPage.vue` merely so the route can render one component. That duplicates the concept of a page without introducing an ownership boundary.

Page-only visual sections belong in `components/pages/<page>`. This is the closest safe colocation in Nuxt: placing arbitrary section components inside `app/pages` would make them candidates for filesystem routing. A homepage section should therefore be easy to find from either side:

```text
pages/index.vue
components/pages/home/HomeHeroSection.vue
components/pages/home/HomeProofSection.vue
```

Use `features` only where behavior or domain knowledge genuinely crosses section or route boundaries. The blog routes may compose author cards and article navigation from `features/blog`; the docs route may use navigation and scrollspy from `features/docs`; campaign and normal layouts may both use `features/campaign-context`. A visual section used by two unrelated pages becomes `components/marketing` only after it has a stable shared contract.

Remove one-line page barrels and duplicate `*Page.vue` wrappers during the cutover. The route should import its sections and feature capabilities directly. This keeps the most important page-level decisions visible in one place while still keeping the section implementations small and colocated.

A barrel remains justified only when a real feature exposes several stable capabilities to multiple external consumers and its internals should be private.

## 7. Refactor areas

### 7.1 Fix correctness and production configuration first

Immediate changes:

1. Replace `to="/kontakt"` in `HomeCtaSection.vue` with `useLocalizedPath()("contact")`.
2. Fix the home-section undefined errors by modeling the rendered lists so their values are non-optional. Do not scatter `!` assertions through templates.
3. Resolve the site origin once. `nuxt.config.ts`, canonical URLs, hreflang links, schema URLs, sitemap URLs, raw Markdown links, and agent output must consume the same resolved origin.
4. Update generated-output and schema tests to assert real Lupinum identity and real logo configuration.
5. Make `check:launch` executable without relying on an undeclared binary.
6. Change CI so launch readiness is a normal passing gate once production values are configured.
7. Give each currently unreferenced public image an explicit owner or delete it.

Why first: refactoring while the suite is already red makes it impossible to distinguish structural mistakes from old failures.

### 7.2 Make routes one canonical model

Current localized route information is repeated across `i18n/routes.ts`, content collection configuration, and page metadata.

Target invariant:

> Changing a localized route in one canonical model updates Nuxt routing, content routing, search links, sitemap output, canonical/alternate links, and generated agent URLs.

Recommended direction:

- Keep `i18n/routes.ts` as the canonical static route registry.
- Derive `LocalizedRouteKey` from that registry instead of maintaining a second string union.
- Delete route metadata from page files when the content collection already owns it and the page meta is redundant.
- Where a framework macro requires literal metadata, first test whether an imported readonly constant is supported. Do not introduce a generator until the direct option is proven impossible.
- Verify the invariant through generated routes/output, not by checking that source files contain matching strings.

### 7.3 Separate pages from features

Pages and features answer different questions:

- A page answers: “What does the visitor see at this route, in what order, and with which page-level content and metadata?”
- A feature answers: “What reusable behavior or domain knowledge does the product provide across components, sections, or routes?”

The homepage, about page, contact page, legal pages, campaign pages, and thank-you page are pages—not automatically features. Their Nuxt route files should compose their sections directly. Their route-only visual sections belong under `components/pages/<page>`.

Keep real features for capabilities and domains such as:

- search and command-center behavior;
- docs navigation, content behavior, and scroll position;
- blog authorship and article-specific components;
- service and reference domain components shared by index and detail routes;
- contact-form validation and submission;
- campaign context shared by campaign and normal site layouts;
- consent and tracking boundaries;
- chat, if it is a committed capability.

Within a page route:

- define page metadata and layout;
- load the page's canonical data;
- handle page-level loading, empty, and error states;
- compose page-owned sections and domain features.

Within `components/pages/<page>`:

- render the page's visual sections;
- accept clear props or use a single typed page-content accessor;
- avoid owning global navigation, persistence, provider loading, or cross-route state.

Within a feature:

- components render feature-owned UI;
- feature composables own reactive feature behavior;
- plain feature modules own normalization, ranking, validation, and other pure logic;
- tests sit next to the behavior they protect.

Delete layers that only forward unchanged values or components. Examples include a one-line barrel with one consumer, a `HomePage.vue` rendered only by `pages/index.vue`, or `DocsDetailPage.vue` when the route can directly compose `DocsPageContent` with docs feature behavior.

### 7.4 Composable decisions

| File                         | Decision                                                                                            | Reason                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `useCanonicalUrl.ts`         | Keep globally and fix origin ownership                                                              | Cross-feature reactive URL boundary                                                         |
| `useLocalizedPath.ts`        | Keep globally; derive its key type                                                                  | Canonical localized routing API                                                             |
| `useLocalizedRouteSwitch.ts` | Keep globally                                                                                       | Content-aware locale switching is cross-feature behavior                                    |
| `useSchemaJsonLd.ts`         | Keep globally                                                                                       | Small, truthful structured-data boundary                                                    |
| `useTracking.ts`             | Keep globally; remove unused returns and redundant wrappers only when that makes call sites clearer | Privacy-aware event dispatch is a real shared boundary                                      |
| `useCookieConsent.ts`        | Keep shared                                                                                         | Consent state and lifecycle are cross-cutting; pure rules should remain in `lib/consent.ts` |
| `useSiteConfig.ts`           | Rename to `useSiteNavigation`; stop returning raw config                                            | It currently constructs shell navigation rather than owning config                          |
| `useCommandCenter.ts`        | Move into `features/search` and split pure logic                                                    | Search is a major product feature, not a generic global helper                              |
| `useCampaignContext.ts`      | Add inside `features/campaign-context`                                                              | Session-scoped cross-layout journey state, not a global utility or page concern             |
| `useBlogAuthors.ts`          | Move into blog and use the canonical authors collection                                             | Blog-only and currently duplicates content loading                                          |
| `useScrollspy.ts`            | Move into docs and simplify to one observation strategy                                             | One feature owns it; current observer and scroll listener duplicate work                    |
| `useChat.ts`                 | Move beside chat UI                                                                                 | Chat-specific state should be colocated                                                     |
| `useBreadcrumb.ts`           | Delete unless a real UI consumer appears                                                            | Currently unused; URL-derived titles are wrong for localized editorial content              |
| `docsNavigation.ts`          | Keep as a plain docs module, not a composable                                                       | Pure functions should not live under a composable label                                     |

The goal is not to make `app/composables` tiny. The goal is that every file there is genuinely cross-feature and genuinely reactive.

### 7.5 Treat search as a product subsystem

Search is required and should remain. The problem is not its existence; it is that approximately 850 lines of search behavior are divided into one large composable and one large component without focused tests.

Refactor into two layers:

#### Pure search domain

`features/search/command-center.ts` should own:

- `CommandCenterItem` and group types;
- group metadata and collection-to-group mapping;
- normalization and tokenization;
- ranking/scoring;
- deduplication;
- grouping and limits;
- recent-item serialization and legacy normalization.

This file must not call Nuxt composables, Vue APIs, tracking, navigation, local storage, or browser globals.

#### Reactive orchestration

`features/search/useCommandCenter.ts` should own:

- content search queries;
- reactive query state;
- navigation sources;
- open/close state;
- persistence adapters;
- selection side effects;
- tracking;
- page-highlight handoff.

The dialog component should own keyboard/focus/rendering behavior only.

Additional search corrections:

- Derive page items from canonical site navigation and route registries; do not hand-maintain another page catalog.
- Derive collection groups from one typed map.
- Keep docs navigation adaptation behind a small exported docs contract rather than importing docs internals from a global composable.
- Add relevance fixtures for real queries in German and English.
- Test recent-item migration and deduplication.
- Benchmark the generated search index and interaction latency before adopting an external search service.

Do not migrate search providers merely for theoretical scale. A provider change is justified when measured index size, load cost, relevance, or latency exceeds an agreed budget.

Suggested initial budgets:

- search interaction should remain responsive on an ordinary mobile device;
- query-to-render should remain below 100 ms after the index is ready;
- the search payload should have an explicit compressed-size budget;
- the top expected result for a maintained fixture set should remain stable.

### 7.6 Add campaign landing pages without creating a second site

Campaign landing pages should be part of the same Nuxt application, route registry, brand system, analytics model, and deployment. They should use a dedicated layout because their job is different from a normal information page: preserve message match from the advertisement, establish trust, answer the offer-specific objections, and make one conversion action easy.

The right mental model is **one site, two navigation modes**:

```text
paid ad
  -> focused campaign landing page
       -> primary conversion
       -> optional “Explore Lupinum” path
            -> normal site with campaign return bar
                 -> return to campaign offer
                 -> dismiss or convert, which clears the campaign context
```

#### Campaign layout

Add `app/layouts/campaign.vue` with:

- a slim branded header containing the Lupinum logo, the campaign CTA, and a quiet “Explore the full website” link;
- no full mega-navigation, command-center trigger, chat launcher, or unrelated promotional banner;
- one clearly dominant offer CTA repeated at appropriate decision points;
- enough proof, process, scope, objections, and company identity to make a high-consideration B2B decision credible;
- a minimal footer with imprint, privacy, accessibility, and a route to the full website;
- locale continuity when a localized version of the campaign exists.

Reduced navigation is focus, not disguise. The page must still look and read like Lupinum, expose who is making the offer, and let cautious visitors inspect the company.

#### Normal-site return path

When a visitor leaves a campaign page for the full site, show a slim, dismissible `CampaignReturnBar` in or directly below the normal sticky header. For the Website clarity conversation it points back to the exact offer in one action. It should be visually subordinate to the main header but remain easy to find on desktop and mobile.

Do not show this bar to direct visitors. Do not permanently replace the site's normal primary CTA with a campaign CTA. If a free audit is a generally available product offer, it may also have a normal site-wide CTA, but that is a separate product decision; the return bar exists only to preserve the active visitor's journey.

#### Session-scoped campaign context

Create a small `features/campaign-context` capability rather than spreading query checks through the header and pages:

```ts
type CampaignContext = {
  campaignKey: string;
  offerKey: string;
  landingPath: string;
  returnLabelKey: string;
  startedAt: number;
};
```

Rules:

1. Entering a registered campaign page activates its context.
2. The “Explore the full website” link carries the allowlisted `website-clarity` campaign key once, so the server-rendered navigation can hand off reliably.
3. The client stores the normalized context in `sessionStorage`, not indefinite `localStorage`.
4. The normal site shell reads that context and renders the return bar.
5. Returning to the campaign restores the focused campaign layout.
6. Conversion, explicit dismissal, an invalid/expired campaign, or the end of the browser session clears it.
7. If a visitor enters another campaign, the most recent campaign wins; do not build a campaign history stack.

Only store allowlisted, non-personal campaign and offer identifiers. UTM values may be captured for attribution through the tracking boundary, but arbitrary query values or personal form data must never be copied into the context.

#### Page and feature placement

Start with a bespoke placeholder page, not a generic landing-page renderer:

```text
app/pages/campaigns/website-clarity.vue
app/components/pages/campaigns/website-clarity/
  WebsiteClarityHeroSection.vue
  WebsiteClarityOutcomesSection.vue
  WebsiteClarityProcessSection.vue
  WebsiteClarityFormSection.vue
app/layouts/campaign.vue
app/features/campaign-context/
  campaign-context.ts
  useCampaignContext.ts
  components/CampaignReturnBar.vue
  campaign-context.test.ts
```

The campaign route is the page composition root. Its sections are colocated page components. Only the cross-layout context is a feature. Extract shared campaign sections or a content-driven campaign schema after several real pages demonstrate a repeated structure; doing so for the first campaign would guess at an abstraction before conversion work reveals the true variants.

#### Shell isolation and performance

`app/app.vue` currently mounts search highlighting, the command center, chat, and service loading globally. The campaign layout cannot be meaningfully isolated if all normal-site interaction code still mounts and ships there. Move search and chat UI into the normal site shell/layout. Keep only genuinely universal foundations—such as consent and the essential tracking boundary—above the layouts. Provider scripts must remain consent-aware and campaign pages should load only what their measured journey needs.

#### SEO, analytics, and offer truth

- Paid-only variants should default to `noindex` unless there is an explicit organic-search reason to index them.
- Canonical URLs must exclude UTM and handoff parameters.
- Track a small typed funnel: campaign view, primary CTA, explore site, return to campaign, dismiss return bar, form start, and conversion.
- Preserve campaign attribution through the normal tracking boundary rather than creating campaign-specific analytics calls.
- Add A/B variant infrastructure only when a real experiment, allocation rule, and success metric exist.
- Ensure the campaign's promised offer has one canonical `offerKey`, name, scope, and qualification rule.

The current site copy describes the Website-Check as paid. “Free audit” must therefore not become alternate wording for that paid product by accident. Either the campaign promotes the paid Website-Check truthfully, or the free audit is defined as a distinct, deliberately scoped diagnostic offer. Offer wording, form expectations, confirmation copy, CRM attribution, and the return bar must all use the same canonical offer definition.

Acceptance criteria for the campaign journey:

- a direct visitor never sees campaign chrome or a return bar;
- an ad visitor sees a focused, branded page and can still inspect the full site;
- after entering the full site, the visitor can return to the exact campaign offer in one action;
- refresh and internal navigation preserve the return path for the current session;
- dismissing the return bar or completing the conversion clears it;
- the campaign page does not mount the full header, search dialog, or chat launcher;
- keyboard, reduced-motion, mobile, consent, legal, and localization behavior meet the same standards as the main site;
- no personal data is persisted in campaign context;
- canonical and indexed output do not contain attribution parameters.

### 7.7 Clarify content versus i18n ownership

Use i18n for application language:

- navigation labels;
- buttons and controls;
- validation and status messages;
- accessibility text;
- short reusable UI copy.

Use content collections for editorial and discoverable material:

- blog posts;
- references;
- services;
- docs/wiki pages;
- legal documents;
- authors, FAQs, and testimonials when they become real content sources.

Highly composed marketing pages such as the homepage sit between those categories. The current side-by-side bilingual message source is defensible, but the unchecked `tm(...) as X[]` boundary is not.

Recommended incremental path:

1. Move page-specific message sources beside their page sections, for example `components/pages/home/home.content.ts`, while retaining the current global message aggregator.
2. Define rich page-data shapes once in that page folder; define domain shapes in the owning feature.
3. Validate localized source objects with `satisfies` or contain the unavoidable conversion in one typed page/domain accessor.
4. Stop redefining the same item interfaces independently in multiple section components.
5. When the editorial workflow is known, evaluate a structured localized content collection for large marketing pages. Do not migrate the homepage to YAML merely for architectural purity.

For agent/LLM output, do not hand-rewrite app-page summaries separately from canonical content. Either derive them from the same feature content source or intentionally keep them as short metadata-only summaries.

Placeholder content should be classified rather than confused with dead architecture:

- `placeholder`: scheduled to be replaced before launch;
- `fixture`: intentionally retained to exercise a component or pipeline;
- `production`: canonical public content.

Fixtures should not appear in production sitemap, search, or agent output unless they are also legitimate public examples.

### 7.8 Make integrations one derived system

The planned repeatability justifies a supported integration catalog. The current problem is duplicate enumeration across site config, schema validation, service registry, scripts, privacy inventory, and tests.

Keep these concepts:

- supported integration definitions;
- site-specific activation and credentials;
- consent categories;
- privacy inventory;
- runtime script loading;
- launch validation.

Make them derive from one catalog:

```text
integration catalog
  -> site activation validation
  -> consent categories
  -> privacy-service inventory
  -> runtime loader dispatch
  -> launch-readiness requirements
```

`site.config.ts` should own which integrations this site enables and their public IDs. The catalog should own provider capabilities, consent category, consent-mode support, and localized legal labels. Runtime loader code may still require an explicit exhaustive switch because loading providers is behavior, not data.

Do not introduce a generic plugin framework. A typed catalog plus an exhaustive runtime dispatcher is sufficient and easier to debug.

The Zod site schema is justified for a replicable site configuration only if it runs at a real boundary. Parse the final config during Nuxt setup/build so invalid provider combinations fail before deployment. A schema used only in tests is a second type system without runtime value.

### 7.9 Keep the content-component package, improve its contract

`packages/content-components` is justified by the explicit reuse goal and the large docs/wiki surface.

Retain:

- the Nuxt module boundary;
- prose components;
- MDC components;
- the tag registry;
- agent Markdown serialization support;
- package-level tests.

Refactor:

- Remove mandatory `build:packages` calls from ordinary `dev`, `check`, and test flows if the workspace development export can reliably consume source.
- Keep package building for production build, pack/publish validation, and CI package-contract checks.
- Make host requirements explicit: Nuxt, Vue, i18n, icons, and any auto-imported composables.
- Import package runtime dependencies explicitly where feasible instead of relying on accidental host auto-imports.
- Replace tests that freeze exact Tailwind strings with render/contract tests for behavior, slots, accessibility, and tag registration.
- Mark experimental MDC components explicitly instead of pretending every component has equal stability.

Do not delete a content component only because current placeholder Markdown does not use it. Delete it when it has no planned role in the agreed content authoring system, or move it to an experimental catalog excluded from the stable public contract.

### 7.10 Replace implementation-text tests with the right test layer

The current suite contains valuable pure and generated-output tests, but too many assertions freeze source structure.

Target test model:

#### Pure behavior tests

- route helpers;
- content normalization;
- search ranking and grouping;
- consent rules;
- form validation and payload mapping;
- tracking sanitization;
- schema generation;
- integration activation validation.

#### Component contract tests

- complex MDC interactions;
- forms;
- consent settings;
- search keyboard navigation and selection;
- docs navigation behavior.

#### Generated-output tests

- canonical and alternate URLs;
- sitemap and robots output;
- llms/raw Markdown output;
- schema graphs;
- localized routes;
- one valid main landmark per page;
- absence of production placeholders from public output.

#### Small policy checks

Keep only policies that cannot be expressed more directly, for example:

- provider globals may only appear in the integration runtime;
- form endpoint literals may only appear in form configuration;
- `components/ui` may not import feature or business code.

Policy checks should scan a rule over a directory. They should not assert that a particular file contains a particular import, class, quote style, or old-path tombstone.

Generated-output tests must not silently skip because `.output` is missing. The documented test task should build/generate the required fixture or the test should fail with a clear prerequisite error.

### 7.11 Comment style

Comments should explain constraints and non-obvious decisions:

- why a Nuxt hook is configured unusually;
- why a route or content adapter exists;
- why consent loading must occur in a particular order;
- why a docs-navigation warm-up call is necessary;
- why a search ranking weight exists and what user behavior it represents.

Delete comments that:

- label obvious template regions such as “Desktop Nav” or “Icon”;
- narrate the next line;
- preserve commented-out experiments;
- divide an oversized file into visual chapters instead of fixing its responsibilities.

Git preserves experiments. Commented-out Vue templates are not documentation.

### 7.12 Dead-code and future-code policy

The clarified roadmap means “unused today” is not identical to “unneeded.” Before deleting an apparently unused feature, component, collection, or integration, classify it:

| Classification                                     | Treatment                                              |
| -------------------------------------------------- | ------------------------------------------------------ |
| Required by an agreed upcoming site capability     | Keep, assign an owner, and add an acceptance criterion |
| Reusable package capability with a stable contract | Keep in the package and test the contract              |
| Placeholder content for an active page/collection  | Keep temporarily, mark and schedule replacement        |
| Regenerable UI primitive with no consumer          | Delete; regenerate when needed                         |
| Superseded component with no consumer              | Delete in the same cutover                             |
| Speculative app feature with no owner or roadmap   | Delete                                                 |

This avoids both extremes: keeping arbitrary code “just in case” and deleting planned infrastructure merely because content work is incomplete.

## 8. Staged implementation plan

### Phase 0: restore trust

Work:

- fix localized contact navigation;
- fix home-section type errors through non-optional models;
- unify canonical origin resolution;
- repair stale identity/logo tests;
- repair `check:launch` and CI launch semantics;
- resolve orphaned assets.

Acceptance criteria:

```sh
vp run check
vp test
vp run check:assets
vp run check:launch
vp run build
```

All pass on a clean checkout. No expected-red gate remains.

### Phase 1: make ownership explicit

Work:

- move page composition into the Nuxt route files;
- move route-only visual sections into `components/pages/<page>`;
- delete duplicate `*Page.vue` wrappers rather than flattening them;
- remove route-only one-line barrels;
- move shared content rendering UI to `components/content`;
- move `ModeToggle` into `components/site`;
- move blog-, docs-, search-, and chat-specific composables into their features;
- rename `components/business` to `components/marketing` and colocate page-only components under their page.

Acceptance criteria:

- no global composable imports feature internals;
- every route file visibly owns its metadata, data loading, and section order;
- a developer can find a page's visual sections from `components/pages/<page>` and a feature's behavior and tests from its feature folder;
- no route renders a single duplicate `*Page.vue` wrapper without a meaningful boundary;
- no old and new directory paths remain in parallel.

### Phase 2: establish canonical models

Work:

- derive localized route key types and route consumers from the route registry;
- parse site configuration at build time;
- create one integration catalog and derive privacy/consent/launch metadata;
- make authors use the canonical content collection;
- remove duplicate identity and business-type values;
- make all public URL generation use the resolved site origin.

Acceptance criteria:

- changing a route requires one source edit;
- changing an enabled integration requires one activation edit;
- invalid integration configuration fails during build;
- author data has one loading path;
- canonical, schema, sitemap, search, and agent URLs agree.

### Phase 3: harden search

Work:

- create `features/search`;
- extract and test pure ranking, grouping, deduplication, and recent-item logic;
- derive page/search catalogs from canonical sources;
- reduce the dialog component to view and interaction behavior;
- add bilingual relevance fixtures and performance budgets.

Acceptance criteria:

- pure search tests run without Nuxt or DOM setup;
- adding a content collection requires one typed mapping change;
- expected German and English queries return maintained top results;
- recent storage survives upgrades through a tested normalization path;
- no manually duplicated global page catalog remains.

### Phase 4: add the campaign journey

Work:

- add the reduced-distraction `campaign` layout;
- add a bespoke `campaigns/website-clarity.vue` page and colocated sections;
- add the session-scoped, allowlisted `campaign-context` feature;
- add the dismissible return bar to the normal site shell;
- move normal-site-only search and chat mounting out of `app.vue`;
- add canonical/noindex policy, typed funnel events, offer truth, and campaign-context tests.

Acceptance criteria:

- direct visitors never see campaign continuity UI;
- campaign visitors can inspect the full site and return to the exact offer in one action;
- reload and internal navigation preserve context only for the current browser session;
- dismissal and conversion clear context;
- the campaign layout omits full navigation, search, and chat without losing brand, legal, consent, locale, or accessibility requirements;
- no arbitrary query values or personal data enter campaign persistence;
- the Website clarity conversation remains a distinct canonical offer from the paid Website-Check.

### Phase 5: content and i18n cutover

Work:

- replace placeholder blog, reference, docs, author, and legal content with production content as it becomes available;
- mark intentional fixtures and exclude non-public fixtures from production discovery;
- colocate page message sources with their page sections;
- centralize rich message typing;
- derive agent app-page output from canonical content or metadata.

Acceptance criteria:

- every sitemap/search/llms entry is intentionally public;
- placeholder content is machine-detectable and has an owner;
- feature components do not repeat rich item interfaces or scatter unchecked `tm` casts;
- editorial content and UI language have documented, non-overlapping ownership.

### Phase 6: package and test contracts

Work:

- make workspace development consume `content-components` source without redundant rebuilds where supported;
- document and test package host requirements;
- replace styling-substring tests with package render/contract tests;
- consolidate architecture policy checks;
- ensure generated-output tests always run in their documented workflow.

Acceptance criteria:

- ordinary development does not rebuild the package unnecessarily;
- production/package builds still verify distributable output;
- renaming an internal file or changing an equivalent CSS implementation does not break behavior tests;
- breaking an MDC contract, route, canonical URL, search result, or public output does break a test.

## 9. What should not be refactored merely for novelty

- Keep Nuxt filesystem routing.
- Keep route files as visible page composition roots.
- Keep domain-feature ownership for reusable behavior; do not turn pages back into mirrored features.
- Keep Ginko content collections and direct collection APIs; do not add app wrapper services without a real need.
- Keep the i18n locale and route registry design.
- Keep pure consent, form, schema, error, and tracking logic separate from Vue components.
- Keep the reusable content-component package.
- Keep search and docs as first-class product capabilities.
- Keep campaign landing pages inside the same application and brand system.
- Keep explicit, boring runtime dispatch for provider-specific behavior.
- Do not introduce a generic campaign page builder until several real campaigns prove a stable repeated contract.
- Do not introduce a generic repository/service layer, event bus, state machine, or plugin framework simply to make the architecture look more formal.

## 10. Architecture rules for future work

1. Every important concept has one canonical owner.
2. Page-specific visual code is colocated under `components/pages/<page>`; feature-specific behavior is colocated with the feature.
3. App-level composables are reactive and cross-feature; pure feature logic is a plain feature module.
4. Route files own page metadata, page-level queries, states, and section composition; reusable behavior lives in features.
5. UI primitives are domain-free.
6. Shared marketing components must have real cross-page consumers and a stable contract.
7. Editorial content belongs to content collections; reusable UI language belongs to i18n.
8. Rich localized data crosses one typed boundary, not repeated `as` casts.
9. Search sources derive from canonical navigation and content models.
10. Integration metadata is declared once and derived everywhere else.
11. Campaign context is session-scoped, allowlisted, non-personal, dismissible, and owned by one feature.
12. A package boundary must provide a stable contract and must not unnecessarily slow daily development.
13. Tests protect behavior, public output, contracts, and broad policies—not filenames or implementation spelling.
14. Comments explain non-obvious constraints and decisions; commented-out code is deleted.
15. Planned-but-unused capabilities need an owner and acceptance criterion.
16. Superseded paths are removed in the same refactor; no compatibility layer is added for unreleased internal structure.

## 11. Definition of done

The refactor is complete when:

- all documented quality gates pass from a clean checkout;
- the repository identifies Lupinum while preserving an explicit reference-architecture purpose;
- Nuxt route files visibly compose their pages and page-only sections are colocated by page;
- docs/wiki, blog, references, services, and search have clear feature ownership;
- routes, site origin, identity, authors, and integrations each have one source of truth;
- campaign pages use a focused shell while preserving a tested, session-scoped path into the full site and back;
- the campaign offer, return UI, form, confirmation, and analytics use one canonical offer definition;
- search ranking and recent-item behavior are tested as pure logic;
- content-package contracts are tested without freezing cosmetic implementation details;
- placeholder content is tracked separately from architectural code;
- deleting or replacing a feature does not require discovering hidden registrations across unrelated folders;
- future developers can determine where a change belongs from the ownership rules in this document.

The success measure is not line-count reduction. It is that the large site can grow without accumulating additional sources of truth, global orchestration, or tests that punish legitimate refactoring.
