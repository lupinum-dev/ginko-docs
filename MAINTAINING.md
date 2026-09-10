# Maintaining Ginko Docs

Ginko Docs publishes `@lupinum/ginko-docs` from `layer/`. Ginko Content is a required peer. Each consuming Nuxt application owns one explicit Ginko Content version.

## Setup and daily work

Use the Node version from CI and the package manager declared in `package.json`.
Root scripts use the Vite+ binary installed with the declared dependencies.
Use `pnpm exec vp` for a focused tool command outside a package script; no global
Vite+ installation is required. Install without changing dependency resolution:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the loopback URL printed by Nuxt (normally `http://localhost:3000`). The
representative target is the docs app; no accounts, database, or credentials are
needed. Keep one server running while editing. Stop it with Ctrl-C when finished;
close owned browser sessions and preserve unrelated processes and files.

The site includes public font/image services and Plausible analytics. For an isolated
browser trial block `https://plausible.io/**`
or substitute its script in that browser session. Do not use production credentials.

| Command               | Purpose                                                                            |
| --------------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`            | Run the bilingual docs app.                                                        |
| `pnpm build`          | Generate the layer's JavaScript content entry from its typed source.               |
| `pnpm docs:build`     | Build and prerender the documentation application.                                 |
| `pnpm verify`         | Complete local handoff gate: policy, audit, source checks, tests, and docs output. |
| `pnpm audit:all`      | Audit the complete workspace, including docs dependencies.                         |
| `pnpm release:verify` | Run the handoff gate, reproducible packaging, and isolated packed consumers.       |

Use a focused test while editing, for example
`pnpm test --run layer/app/features/docs/docs-navigation.test.ts`, then run the
final gate once. Do not run every child and then its aggregate again.
Do not commit `layer/.pack`, `.nuxt`, `.output`, or generated archives.

## Representative browser journey

Open `/docs/getting-started`, follow a sidebar link, switch to German, and check
the translated destination and active sidebar item. Open search, close it with
Escape, and check that focus returns to the trigger. At a phone-sized viewport,
open the menu, follow a docs link, and check theme controls and menu focus recovery.
For authored-component changes, inspect the relevant rendered examples in both
locales. Diagnose console errors and failed local requests before accepting a result.

A controlled failure trial can temporarily introduce invalid frontmatter in an
agent-owned content page, observe the parser diagnostic, restore it, and verify
recovery. Keep this temporary fault out of the commit.

## Verification evidence

| Stage                | Input and preparation owner                                                                                                                                                                                  | Local and hosted evidence                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Source checks        | `verify` owns lint, Nuxt types, unit tests, policy checks, and workspace audit. The generated-entry test builds an independent temporary output and compares bytes.                                          | Local handoff and PR/main CI.                                                                       |
| Docs build           | `docs:build` owns one workspace app build; `verify` calls it once.                                                                                                                                           | Prerendered content and examples; independent browser exploration is still required for UI changes. |
| Reproducible package | `release:pack` builds two independent tarballs through prepack and compares bytes, then retains one archive and manifest.                                                                                    | Local release verification and main CI.                                                             |
| Packed consumers     | `release:certify` consumes that retained archive in three isolated installs, types/builds each configuration, and runs desktop/mobile Chromium. It checks installed minimum Nuxt and Ginko Content versions. | Single-locale tabs and bilingual dropdown/list behavior; not every version in the peer ranges.      |
| Publication          | Main CI retains the certified candidate. Protected Publish verifies bytes, provenance, and release recovery.                                                                                                 | Hosted only; local certification does not prove registry or account settings.                       |

Release certification needs Chromium. Use
`pnpm exec playwright-core install chromium` if no supported local Chrome exists;
CI installs Chromium and its Ubuntu system dependencies. Windows, other browser
engines, and other Node versions are not covered by this CI lane. Failed fixture
directories are retained in the system temporary directory for diagnosis; remove
only those owned directories after resolving the failure.

## Authority

An assigned routine task includes setup, diagnosis, implementation, independent
review, PR completion, authorized protected merge, post-merge checks, and cleanup.
Routine bug fixes, documentation fixes, updates within supported dependency ranges,
and version preparation may proceed when scope is bounded, compatibility and
permissions are unchanged, rollback is known, and required checks pass. Meaningful
code, CI, and dependency changes need independent review of the final diff.

Library documentation deploys automatically from protected main. npm publication
still requires one protected human approval of the exact release candidate.
Escalate unresolved product or compatibility choices, purchases, customer messages,
destructive data changes, and changes to safeguards or delegation. Prepare the
concrete decision first and continue other authorized work. Repository instructions
cannot override user instructions, tool limits, or access controls; a PR cannot
expand its own authority.

## Quick fixes

Create one focused branch and reproduce the defect with a test. Change the
smallest owning surface. Run the focused test, then run `pnpm verify`. Open a
pull request and use the normal protected merge path.

## Large changes

Open an issue before implementation. Record the intended public contract and
the main failure boundary. Split unrelated work into separate pull requests.
Update tests and public documentation in the same change.

## Documentation changes

Follow `docs/WRITING.md`. Update English and German pages together when they
share one numeric content identity. Run `pnpm docs:build` and inspect the
affected desktop and mobile journeys before handoff.

## Dependencies

Update dependencies in one focused pull request:

```bash
pnpm outdated
pnpm update
pnpm install
pnpm release:verify
```

Review the lockfile. Keep the exact Ginko Content development dependency equal to the minimum supported peer version.

`pnpm check:dependencies` validates quarantine policy during ordinary verification
and the daily CI policy lane. The packed certifier validates the policy of each
generated install before installation. Temporary exclusions must name one exact
package/version with an inline JSON comment containing `reason`, `owner`, and
`expires` in UTC; expiry must be within 24 hours. Remove the exclusion and comment
together after expiry. The checker is a repository-owned copy of the reviewed
Lupinum OSS shared asset; update it from that source, including its review evidence.

The root pnpm override keeps `esbuild` on a patched release until `@nuxt/fonts` does so directly. Review this override after 2026-09-01. Remove it when the resolved dependency graph remains secure without it.

Packed fixtures use the exact Rolldown version from the root manifest. This keeps
Rolldown and its native bindings on the reviewed workspace version when their
registry publication times differ. Update that pin with normal dependency updates;
the fixtures keep the same 24-hour quarantine and check the installed version.

## Release preparation

1. Choose the version.
2. Generate `CHANGELOG.md` and update `layer/package.json`:

   ```bash
   pnpm release:prepare -r 0.4.0-rc.2 --from v0.4.0-rc.1 --to HEAD
   ```

   Replace the example version and previous tag. The command does not commit,
   tag, push, or publish.

3. Update public install examples to the same version. `layer/nuxt.config.ts`
   derives its version from the package manifest; do not add a second version there.
4. Set the exact Ginko Content development dependency and the supported peer range.
5. Commit the release preparation.
6. Run `pnpm release:verify` from the clean commit.
7. Open a pull request and merge it only after `PR verification` passes.

Changelogen reads Conventional Commits and owns the changelog format. Review
the generated text before you commit it.

## Protected publishing

The `CI` workflow certifies the exact `main` commit and uploads one release
artifact. A successful current-`main` CI run starts `Publish` automatically.
The workflow derives the reviewed version and CI run from that artifact,
verifies it again, and stops without approval when the release is already
complete. A new publication pauses at the protected `npm` environment,
publishes through npm trusted publishing, and creates the GitHub release. If
the automatic event was missed, run the input-free `Publish` dispatch from
`main`. It selects one unique incomplete retained candidate and fails instead
of guessing when more than one candidate is plausible.

For a new release, the version and its `v<version>` tag do not exist before the
workflow starts. During recovery, an existing tag must target the same certified
main commit. Do not prepare or push a release tag from a workstation during a
normal release.

The npm trusted publisher must use these values:

- Package: `@lupinum/ginko-docs`
- Repository: `lupinum-dev/ginko-docs`
- Workflow: `publish.yml`
- Environment: `npm`
- Permission: `publish`

The GitHub `npm` environment must allow only `main` and require a reviewer. Do not add an `NPM_TOKEN`.

Never publish from a workstation. Never run Changelogen with `--release` or `--publish`. The protected workflow publishes the already-certified tarball and creates the release. The only manual-tag exception is a historical npm publication whose provenance, retained artifact, absent tag, and source SHA were verified first. In that case, use only the exact `HUMAN-ONLY` lightweight-tag command printed by the failed GitHub Release job, verify the remote tag target, and rerun only that job.

## Recovery

If publishing fails, do not build a replacement tarball. Rerun the failed job
when the existing workflow is correct. If the workflow itself needs a fix,
retain the original candidate and reconcile from its certified source SHA after
the fix with the input-free `Publish` dispatch. Never dispatch a later `main`
commit to repair an earlier npm version.

If npm already accepted the exact certified bytes, the workflow verifies the
registry SHA-1 and uses an isolated Sigstore 5 verifier to cryptographically
verify the provenance, exact publishing workflow, source commit, and tarball
SHA-512 in the unprivileged job. The protected job accepts only that
verification record and stops if registry existence or bytes changed before
approval. It then skips publication and completes the same GitHub release. A
GitHub-only failure does not require a new package version.

## Credential incidents

Disable the affected credential or integration first. Review GitHub audit logs,
workflow runs, npm provenance, and published versions. Do not rotate credentials
into repository files or workflow secrets. This repository publishes with OIDC
and must not contain an `NPM_TOKEN`. Report the incident through the private
security process and document the recovery in a focused pull request.

## Audit external settings

Review these settings in January and July, and after an ownership or release
workflow change.

GitHub must have:

- a protected `main` branch with pull requests, linear history, resolved review
  threads, the required `PR verification` gate, and configured security checks;
  Vercel previews are optional and must not become a required PR check;
- squash merge as the only merge method, auto-merge enabled, and merged branches
  deleted automatically;
- GitHub Actions restricted to full commit-SHA references, with default
  workflow permissions read-only;
- Issues enabled for public reports, with Wikis and Discussions disabled so
  versioned repository documentation remains authoritative;
- protected release tags;
- an `npm` environment that allows only `main`, requires a reviewer, and has no
  package token;
- private vulnerability reporting, secret scanning, push protection, automated
  security fixes, and CodeQL Default Setup for JavaScript and TypeScript;
- Renovate for routine dependency updates and CodeRabbit as an advisory reviewer.

npm must bind `@lupinum/ginko-docs` to `publish.yml` and the `npm` environment
through trusted publishing.

Vercel must deploy the `docs/` app from `main` to `ginko-docs.lupinum.com`.
Pull-request previews run only after a maintainer requests `/vercel`; ordinary
PR pushes must not build automatically. Set the Vercel Root Directory to `docs`. Enable
source files outside the Root Directory so the app can consume the local
`layer/` package. Do not set an Output Directory override; Nuxt emits the
Vercel Build Output API files. Do not set an Install Command override. Vercel
detects pnpm from the repository lockfile and installs the workspace before it
runs the committed build command.

## Standard adoption evidence

Profile: single published Nuxt layer. This repository adopts the operating
contract reviewed in [Lupinum OSS revision 4ce14ab](https://github.com/lupinum-dev/lupinum-oss/commit/4ce14ab396c3d34165e4e407b1b517f682d0f86c).
[Rollout issue 57](https://github.com/lupinum-dev/lupinum-oss/issues/57) records
current PRs, exact tested revisions, independent review, and hosted results.
The dependency checker comes from [the reviewed dependency-policy change](https://github.com/lupinum-dev/lupinum-oss/pull/64).

Adoption evidence belongs in the rollout issue. Record the tested source,
environment, checks, and remaining gates there. Revert the focused adoption PR
to roll back operations; no data or consumer API migration is required.
