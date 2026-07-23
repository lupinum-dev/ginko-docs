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

Publishing is a human-only action. The repository's `release:publish` script is
disabled intentionally.

```bash
VERSION=$(node -p "require('./layer/package.json').version")
npm view @lupinum/ginko-docs@$VERSION version --registry=https://registry.npmjs.org/
tar -tzf layer/.pack/lupinum-ginko-docs-$VERSION.tgz | less
cat layer/.pack/release-artifact.json
cat layer/.pack/release-certification.json
npm login --registry=https://registry.npmjs.org/
npm publish layer/.pack/lupinum-ginko-docs-$VERSION.tgz \
  --access public \
  --tag latest \
  --registry=https://registry.npmjs.org/
npm view @lupinum/ginko-docs@$VERSION version --registry=https://registry.npmjs.org/
```

Tag only the exact green commit and attach the inspected tarball to its GitHub
release. Never commit `layer/.pack`, `.nuxt`, `.output`, or generated archives.
