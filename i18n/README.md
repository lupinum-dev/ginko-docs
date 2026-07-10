# i18n message ownership

Static app and page chrome lives in `i18n/messages` as colocated German/English message modules. Edit page-specific copy in `i18n/messages/pages` and shared UI copy in `i18n/messages/global`.

Each translatable leaf is stored as `{ de: "...", en: "..." }` so reviewers can compare both locales in one place. `i18n/messages/index.ts` derives the locale-shaped object required by Vue i18n.

Localized route paths stay in `i18n/routes.ts`. Content-backed collections such as docs, blog, services, references, legal pages, FAQs, and optional testimonials stay under `content/{locale}`.
