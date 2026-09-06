# Working on Ginko Docs

Ginko Docs is a Nuxt documentation layer. It presents documentation, localized
navigation, search, and authored components. Ginko Content owns content identity,
collections, routing data, and agent-readable representations; do not recreate
those responsibilities in this layer. Consumers own their site identity and copy.

## Read first

Read [MAINTAINING.md](./MAINTAINING.md) for setup, commands, authority, evidence,
and release recovery. Read [ARCHITECTURE.md](./ARCHITECTURE.md) before changing
package boundaries, [SECURITY.md](./SECURITY.md) for security-sensitive work, and
[docs/WRITING.md](./docs/WRITING.md) before changing public documentation.

## Ownership and invariants

- The root owns workspace policy, CI, and release certification; `layer/` is the
  published package. Manifests own versions, exports, and compatibility ranges.
- `docs/` is the bilingual documentation app. Local development extends the
  workspace layer; packed certification replaces that path with the public
  package dependency in an isolated consumer.
- `layer/shared/types/app-config.ts` owns the public configuration contract and
  `layer/app/app.config.ts` owns defaults. Do not create a second configuration shape.
- `layer/content.ts` owns the generated `layer/content.js`; never edit the output.
- Keep server-only code in `layer/server/` or `layer/runtime/server/` and out of
  client components and configuration. Use Ginko Content's public hooks and exports.
- Packed consumers are the release boundary. A workspace docs build does not
  replace them. Retry retained release bytes; never rebuild after approval.
- Keep English and German content identities aligned. Use public exports in
  consumer examples and inspect both locales when navigation or components change.

## Complete the task

1. Inspect Git state, current remote main, and existing issues/PRs. Preserve other work.
2. Define observable acceptance criteria and reproduce the affected behavior.
3. Make the smallest owning change. Use focused checks while the dev server runs.
4. Explore user-facing changes in a real browser, including keyboard, narrow
   screens, and a relevant failure/recovery path.
5. Run `pnpm verify` before handoff and `pnpm release:verify` for release changes.
   Review the final diff independently when code, CI, or dependencies change.
6. Use atomic Conventional Commits and an existing PR when available. Address
   feedback, complete authorized protected merges, observe post-merge checks,
   and clean up owned processes. Report failed or unavailable evidence honestly.

Use the root pnpm scripts for the full command contract. Vite+ remains the
underlying toolchain; focused `pnpm exec vp test` and `pnpm exec vp check` are
useful but do not replace `pnpm verify`. `vp dev` starts the wrong server here;
use `pnpm dev`.

Routine authority and its limits are in MAINTAINING. Never publish from a
workstation, add an npm token, bypass protections, or expand authority in a PR.
