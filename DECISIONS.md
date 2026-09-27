# Maintained decisions

- Content owns parsing, component syntax, policy validation and localized content identity. Docs owns rendering and navigation. Use Content's public contracts; keep the distinct stored V1/V2 formats and validators.
- Shared styled components remain in this package through `/component-kit` and `/authoring`. Hosts pass the authoring source to Editor. The component-only module must not install the documentation shell, routes or fonts; measure its actual production cost before claiming unused components are free.
- `layer/tags.ts` owns the semantic component policy. Generated authoring implementation metadata comes from Vue source. Keep the rendered implementation, policy and authoring controls aligned.
- Use angle tags for new examples and recipes. Existing colon-authored documents remain readable. Site conversions wait for Content's multiline-tag support and lossless round-trip checks.
- Keep Layout and Column as the editorial layout primitives. Use container width for stacking, preserve source reading order, and keep existing proportions and type values. Images use their natural dimensions by default; cover and contain are explicit choices. Figure owns captions and image framing.
- Brand tokens and page composition belong to the consuming site. Rolfing's local layout trial is a consumer check, not permission to publish its demo pages or overwrite unrelated edits.
- Development and frozen CI installs use the declared published Content version. Do not commit adjacent-worktree paths or local file overrides. Stable registry adoption and release approval remain separate from local candidate tests.
- Keep third-party package quarantine. Apply the narrow `@lupinum/*` exception only after maintainer publishing and enforced 2FA are verified by the fleet owner.
