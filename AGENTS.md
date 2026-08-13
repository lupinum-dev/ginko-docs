<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. In this repo, the development server must be started with `vp run dev`, not `vp dev`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- run dev - Run the project development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. In this repo, use `vp run dev` for the app dev server and `vp test` for JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Do not use `vp dev` in this repo:** It starts the wrong server path here. Use `vp run dev` for local development.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

## Ginko Docs documentation

The playground content is the public package documentation and a bilingual release fixture.

- Keep `playground/content/en/1.docs` and `playground/content/de/1.dokumentation` structurally equivalent.
- Use the same numeric identities for translated folders and files. German pages use canonical English `$docs/...` and `$blog/...` references.
- Use `sidebar: section` only for the Documentation and Reference areas. Use flat `sidebar: group` folders inside those areas.
- Write consumer examples against public exports. Do not expose layer aliases, route components, repository commands, or obsolete Ginko Content composables.
- Use sentence case, active voice, and labeled file snippets. Frontmatter renders the H1.
- Do not append generic “What's next,” “Related,” “Conclusion,” or equivalent German sections; the site already renders previous and next links.
- Check configuration claims against `layer/content.ts`, `layer/shared/types/app-config.ts`, `layer/app/app.config.ts`, and `layer/tags.ts`.

The complete editorial contract is in `docs/WRITING.md`. Use these root commands:

- `pnpm verify` is the normal handoff gate.
- `pnpm docs:build` builds the documentation application.
- `pnpm audit:all` audits the complete workspace.
- `pnpm release:verify` certifies a release from a clean commit.

Inspect both locales in the rendered site when navigation or authored components change.

## Releases

- Use Conventional Commits and Changelogen. Do not create parallel release-note formats.
- Run `pnpm release:verify` before a release pull request.
- Publish only through `.github/workflows/publish.yml` from an exact successful `main` CI artifact.
- Never run `npm publish`, `changelogen --release`, or `changelogen --publish` from an agent or maintainer workstation.
- Never require branch-name prefixes such as `codex/` or `claude/`. Use a short descriptive branch name when a branch is needed.
- Read `MAINTAINING.md` for the complete dependency and release procedure.
