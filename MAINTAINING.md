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

## Release preparation

1. Choose the version.
2. Update `layer/package.json` and `layer/nuxt.config.ts` to the same version.
3. Set the exact Ginko Content development dependency and the supported peer range.
4. Generate `CHANGELOG.md` with Changelogen.
5. Run `vp run release:verify` from a clean commit.
6. Open a pull request and merge it only after `PR verification` passes.

Changelogen reads Conventional Commits and owns the changelog format:

```bash
vp run changelog -- --from v0.2.5 --to HEAD
```

Replace `v0.2.5` with the previous release tag. Review the generated text before you commit it.

## Protected publishing

The `CI` workflow certifies the exact `main` commit and uploads one release artifact. Start the `Publish` workflow with that CI run ID and the exact version. The workflow verifies the artifact again, pauses at the protected `npm` environment, publishes through npm trusted publishing, and creates the GitHub release.

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
