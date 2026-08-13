# Maintaining Ginko Docs

Ginko Docs publishes `@lupinum/ginko-docs` from `layer/`. Ginko Content is a required peer. Each consuming Nuxt application owns one explicit Ginko Content version.

## Daily work

Create a focused branch from `main`. Use Conventional Commits. Run the relevant tests while you work, then run the complete local gate before you open a pull request:

```bash
vp install
vp run release:verify
```

Do not commit `layer/.pack`, `.nuxt`, `.output`, or generated archives.

## Dependencies

Update dependencies in one focused pull request:

```bash
vp outdated
vp update
vp install
vp run release:verify
```

Review the lockfile. Keep the exact Ginko Content development dependency equal to the minimum supported peer version.

The root pnpm override keeps `esbuild` on a patched release until `@nuxt/fonts` does so directly. Review this override after 2026-09-01. Remove it when the resolved dependency graph remains secure without it.

## Release preparation

1. Choose the version.
2. Generate `CHANGELOG.md` and update `layer/package.json`:

   ```bash
   vp run release:prepare -- -r 0.3.0-rc.5 --from v0.3.0-rc.4 --to HEAD
   ```

   Replace the example version and previous tag. The command does not commit,
   tag, push, or publish.

3. Update `layer/nuxt.config.ts` and the README install command to the same version.
4. Set the exact Ginko Content development dependency and the supported peer range.
5. Commit the release preparation.
6. Run `vp run release:verify` from the clean commit.
7. Open a pull request and merge it only after `PR verification` passes.

Changelogen reads Conventional Commits and owns the changelog format. Review
the generated text before you commit it.

## Protected publishing

The `CI` workflow certifies the exact `main` commit and uploads one release
artifact. Start the `Publish` workflow with the exact version. The workflow
finds the successful CI run for the current `main` commit, verifies its
artifact again, pauses at the protected `npm` environment, publishes through
npm trusted publishing, and creates the GitHub release.

The version and its `v<version>` tag must not exist before the workflow starts.
The workflow creates the tag as part of the GitHub release. Do not prepare or
push a release tag from a workstation.

The npm trusted publisher must use these values:

- Package: `@lupinum/ginko-docs`
- Repository: `lupinum-dev/ginko-docs`
- Workflow: `publish.yml`
- Environment: `npm`
- Permission: `publish`

The GitHub `npm` environment must allow only `main` and require a reviewer. Do not add an `NPM_TOKEN`.

Never publish from a workstation. Never run Changelogen with `--release` or `--publish`. Never create the tag or GitHub release manually. The protected workflow publishes the already-certified tarball and creates the release.

## Recovery

If publishing fails, do not build a replacement tarball. Fix the workflow in a
pull request, let `main` CI certify a new exact artifact, and start `Publish`
again. npm versions are immutable; choose a new version if npm accepted the
package before a later step failed.

## Audit external settings

Review these settings in January and July, and after an ownership or release
workflow change.

GitHub must have:

- a protected `main` branch with pull requests, linear history, resolved review
  threads, and the repository's required CI and Vercel checks;
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

Vercel must deploy the playground from `main` to `ginko-docs.lupinum.com` and
create pull-request previews.
