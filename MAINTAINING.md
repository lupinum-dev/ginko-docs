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
2. Generate `CHANGELOG.md` and update `layer/package.json` with Changelogen.
3. Update `layer/nuxt.config.ts` and the README install command to the same version.
4. Set the exact Ginko Content development dependency and the supported peer range.
5. Commit the release preparation.
6. Run `vp run release:verify` from the clean commit.
7. Open a pull request and merge it only after `PR verification` passes.

Changelogen reads Conventional Commits and owns the changelog format:

```bash
vp run changelog --bump -r 0.3.0-rc.4 --from v0.3.0-rc.3 --to HEAD
```

Replace the target version and previous release tag. Review the generated text
before you commit it. The command does not create a commit, tag, GitHub release,
or npm publication.

## Protected publishing

The `CI` workflow certifies the exact `main` commit and uploads one release artifact. Start the `Publish` workflow with that CI run ID and the exact version. The workflow verifies the artifact again, pauses at the protected `npm` environment, publishes through npm trusted publishing, and creates the GitHub release.

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

If publishing fails, do not build a replacement tarball. Fix the workflow in a pull request, let `main` CI certify a new exact artifact, and start `Publish` with the new CI run ID. npm versions are immutable; choose a new version if npm accepted the package before a later step failed.
