# @lupinum/content-components

Reusable prose and MDC components for Nuxt content sites.

```ts
export default defineNuxtConfig({
  modules: ["@lupinum/content-components"],
});
```

The module registers generic prose and MDC components globally and merges its
`contentComponentTags` into `content.markdown.tags`. It does not define content
collections, routes, sitemap, prerendering, search, i18n, or app navigation.

Apps can add project-specific tags after the module by setting their own
`content.markdown.tags`. Host tags override package defaults with the same key.

## Host contract

The host application must provide Nuxt 4, Vue 3, and `@lupinum/ginko-content`.
The module owns its rendering dependencies and registers its prose/MDC
components, styles, Markdown plugins, and agent-Markdown serializers itself.
It deliberately does not depend on a host shadcn layer, site configuration,
i18n messages, navigation, routes, search, or business components.

During local Nuxt development the workspace export and module resolve source
files directly, so `vp run dev`, `vp run check`, and `vp test` do not rebuild
the package first. `vp run build:packages`, the production app build, and
package prepack still verify the distributable `dist` output.
