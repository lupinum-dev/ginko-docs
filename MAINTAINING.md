# Maintaining Ginko Docs

Ginko Docs publishes `@lupinum/ginko-docs` from `layer/`. Ginko Content is a
required peer so every Nuxt application owns one explicit Content version.

## Verification

Run the complete local gate without publishing:

```bash
vp install
vp run release:verify
```

Inspect the single tarball, `layer/.pack/release-artifact.json`, and
`layer/.pack/release-certification.json`. A release is eligible only when the
source artifact says `sourceClean: true`, certification used the registry
Ginko Content dependency with `releaseEvidence: true`, and both JSON files
name the same tarball and SHA-256.

## Release

Publishing is a human-only action. After inspecting the verified artifact, run
the guarded publish script:

```bash
cat layer/.pack/release-artifact.json
cat layer/.pack/release-certification.json
npm login --registry=https://registry.npmjs.org/
vp run release:publish
```

The script refuses to publish an existing version, a dirty source tree, or an
artifact whose version, commit, SHA-256, or registry-backed certification does
not match the current release.

Tag only the exact green commit and attach the inspected tarball to its GitHub
release. Never commit `layer/.pack`, `.nuxt`, `.output`, or generated archives.
