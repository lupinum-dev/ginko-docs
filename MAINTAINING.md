# Maintaining Ginko Docs

Ginko Docs publishes `@lupinum/ginko-docs` from `layer/`. Ginko Content is a
required peer so every Nuxt application owns one explicit Content version.

## Verification

Run the complete local gate without publishing:

```bash
vp install
vp run release:verify
```

Inspect `layer/.pack/release-artifact.json` and the single tarball. A release is
eligible only from a clean commit whose CI gate passed and whose artifact says
`releaseEligible: true`.

## Release 0.2.2

Publishing is a human-only action. The repository's `release:publish` script is
disabled intentionally.

```bash
VERSION=0.2.2
npm view @lupinum/ginko-docs@$VERSION version --registry=https://registry.npmjs.org/
tar -tzf layer/.pack/lupinum-ginko-docs-$VERSION.tgz | less
cat layer/.pack/release-artifact.json
npm login --registry=https://registry.npmjs.org/
npm publish layer/.pack/lupinum-ginko-docs-$VERSION.tgz \
  --access public \
  --tag latest \
  --registry=https://registry.npmjs.org/
npm view @lupinum/ginko-docs@$VERSION version --registry=https://registry.npmjs.org/
```

Tag only the exact green commit and attach the inspected tarball to its GitHub
release. Never commit `layer/.pack`, `.nuxt`, `.output`, or generated archives.
