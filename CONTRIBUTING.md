# Contributing

## Read this first

Ginko Docs currently accepts limited contributions. Lupinum OG can close or
defer work that does not fit the product direction.

We are most likely to accept small bug fixes, accessibility and reliability
fixes, focused documentation corrections, and maintenance that reduces
complexity.

Open an issue before you start a feature, a breaking change, or a large
refactor.

## Prepare the repository

Use the Node and pnpm versions declared by the repository. Vite+ owns project
commands.

```bash
vp install
vp run check
vp test
vp run build
```

Run `vp run release:verify` when you change package metadata, exports, release
scripts, or release workflows.

## Keep the change focused

- Put one concern in each pull request.
- Explain what changed and why it is necessary.
- Add tests for behavior and failure boundaries.
- Update both documentation locales when their shared structure changes.
- Add before-and-after images for visual changes.
- Use Conventional Commits.
- Follow [docs/WRITING.md](./docs/WRITING.md).

Do not expose layer internals as public consumer APIs. Do not add a second
navigation, search, content, or configuration source of truth.
