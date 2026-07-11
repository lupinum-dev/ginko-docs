# App Structure

This app uses one source of truth per concept. Colocation follows ownership, not file type.

## Routes

`app/pages` contains the actual Nuxt page composition roots. A route owns its page query, SEO/schema setup, layout choice, and section composition. Keep reusable behavior out of routes, but do not hide a route behind a duplicate `*Page.vue` wrapper.

Visual sections used by one page live under `app/components/pages/<page>`. A content-backed detail route may stay mostly self-contained when splitting it would only scatter one coherent document composition.

## Features

`app/features` is for stateful capabilities and reusable domain behavior such as search, campaign continuity, chat, forms, and docs navigation. Feature-only components and composables stay with their feature. Do not create a feature folder merely because a route exists, and do not add one-line barrel files unless they define a real public boundary.

## Shared Components

`app/components/ui` is for shadcn-vue primitives only.

`app/components/site` is for the global shell: header, footer, banner, locale/theme controls, consent UI, and service loader.

`app/components/marketing` is for reusable business website sections and cards.

`app/components/content` is for content rendering shells and feedback UI.

`app/components/pages` is for visual sections owned by one page.

Do not add another shared component category unless an existing category is clearly wrong.

## Config, Lib, And Composables

`app/config` stores canonical business/site configuration and the service registry.

`app/lib` stores pure helpers and integration logic. Keep `app/lib/utils.ts` because shadcn-vue expects `@/lib/utils`.

`app/composables` stores cross-site Vue/Nuxt composables. Feature-owned composables stay inside their feature, for example docs navigation lives in `app/features/docs/composables`.

## Colocation Decision

Keep a component page-local until a second real use or a clear domain invariant justifies sharing it. Consumer count is evidence, not a mechanical rule: privacy, tracking, URL, schema, and form boundaries can be shared earlier because they protect behavior across pages.
