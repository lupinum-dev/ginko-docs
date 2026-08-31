# Changelog

## v0.4.0-rc.5

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.4.0-rc.4...v0.4.0-rc.5)

### 🚀 Enhancements

- **theme:** Add a coordinated Nuxt preset ([4c3d6b9](https://github.com/lupinum-dev/ginko-docs/commit/4c3d6b9))

### 🏡 Chore

- **docs:** Align the documentation runtime ([#45](https://github.com/lupinum-dev/ginko-docs/pull/45))

### ❤️ Contributors

- Mat4m0
- Matthias Amon

## v0.4.0-rc.4

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.4.0-rc.3...v0.4.0-rc.4)

### 🩹 Fixes

- **server:** Keep route types on Nuxt H3 ([9487951](https://github.com/lupinum-dev/ginko-docs/commit/9487951))

### ❤️ Contributors

- Mat4m0

## v0.4.0-rc.3

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.4.0-rc.2...v0.4.0-rc.3)

### 🩹 Fixes

- **footer:** Avoid duplicated site wordmark ([156951c](https://github.com/lupinum-dev/ginko-docs/commit/156951c))

### ❤️ Contributors

- Mat4m0

## v0.4.0-rc.2

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.4.0-rc.1...v0.4.0-rc.2)

### 🚀 Enhancements

- **agent:** Add portable static delivery ([aa82f37](https://github.com/lupinum-dev/ginko-docs/commit/aa82f37))
- **agent:** Adopt static Ginko Content delivery ([c6d2825](https://github.com/lupinum-dev/ginko-docs/commit/c6d2825))

### ❤️ Contributors

- Mat4m0

## v0.4.0-rc.1

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.3.0...v0.4.0-rc.1)

### 🚀 Enhancements

- **content:** Support curated agent indexes ([f81e4e2](https://github.com/lupinum-dev/ginko-docs/commit/f81e4e2))
- **release:** Automate safe reconciliation ([#39](https://github.com/lupinum-dev/ginko-docs/pull/39))
- **content:** Support Ginko Content 1.0 beta ([ce5cf09](https://github.com/lupinum-dev/ginko-docs/commit/ce5cf09))

### ⚠️ Migration

- Replace `defineGinkoDocsConfig().site.url` with the required `site.whenToUse`. Keep the canonical origin in Nuxt Site configuration.

### 🩹 Fixes

- **ci:** Wait for hydration before browser checks ([#35](https://github.com/lupinum-dev/ginko-docs/pull/35))
- **sitemap:** Omit disabled routes and locales ([#36](https://github.com/lupinum-dev/ginko-docs/pull/36))
- **release:** Verify source-bound recovery ([10160d9](https://github.com/lupinum-dev/ginko-docs/commit/10160d9))
- **release:** Make reconciliation input-free ([#40](https://github.com/lupinum-dev/ginko-docs/pull/40))

### 🤖 CI

- Classify expensive verification ([#33](https://github.com/lupinum-dev/ginko-docs/pull/33))
- **vercel:** Cut library preview build usage ([#37](https://github.com/lupinum-dev/ginko-docs/pull/37))

### ❤️ Contributors

- Mat4m0
- Matthias Amon

## v0.3.0

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.3.0-rc.5...v0.3.0)

### 🚀 Enhancements

- **theme:** Keep code blocks dark by default ([#24](https://github.com/lupinum-dev/ginko-docs/pull/24))
- **theme:** Add consumer-configurable syntax highlighting ([#29](https://github.com/lupinum-dev/ginko-docs/pull/29))
- **header:** Adopt Style 08 command + quiet utilities site header ([#30](https://github.com/lupinum-dev/ginko-docs/pull/30))

### 🩹 Fixes

- **standard:** Recover releases without version churn ([#27](https://github.com/lupinum-dev/ginko-docs/pull/27))

### 🤖 CI

- **docs:** Cut unrelated Vercel build usage ([#28](https://github.com/lupinum-dev/ginko-docs/pull/28))

### ❤️ Contributors

- Matthias Amon

## v0.3.0-rc.5

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.3.0-rc.4...v0.3.0-rc.5)

### 🚀 Enhancements

- Complete the Lupinum repository, documentation, preview, and release standard
- Add mobile packed-consumer coverage and keep public package versions synchronized

### 🩹 Fixes

- Use the site-specific Plausible script in the documentation fixture
- Upgrade the Ginko Content peer and playground dependency to 0.4.0-rc.2

### ❤️ Contributors

- Matthias Amon

## v0.3.0-rc.4

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.3.0-rc.3...v0.3.0-rc.4)

### 🩹 Fixes

- Harden Ginko Docs distribution and repository operations ([#13](https://github.com/lupinum-dev/ginko-docs/pull/13))
- **deps:** Clear production security advisory ([#14](https://github.com/lupinum-dev/ginko-docs/pull/14))
- **config:** Provide clean consumer defaults ([#15](https://github.com/lupinum-dev/ginko-docs/pull/15))
- Add shared legal links and release-documentation guardrails

### ❤️ Contributors

- Matthias Amon

## v0.3.0-rc.3

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.3.0-rc.2...v0.3.0-rc.3)

### Fixes

- **analytics:** Render Plausible snippet in document head ([#11](https://github.com/lupinum-dev/ginko-docs/pull/11))

### ❤️ Contributors

- Matthias Amon

## v0.3.0-rc.2

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.3.0-rc.1...v0.3.0-rc.2)

### Fixes

- Support docs-only consumers ([b4484ec](https://github.com/lupinum-dev/ginko-docs/commit/b4484ec))

### ❤️ Contributors

- Mat4m0

## v0.3.0-rc.1

[compare changes](https://github.com/lupinum-dev/ginko-docs/compare/v0.2.5...v0.3.0-rc.1)

### Features

- Prepare Ginko Docs 0.3.0 release candidate ([aff8385](https://github.com/lupinum-dev/ginko-docs/commit/aff8385))

### Fixes

- Keep sidebar top padding without a section switcher ([881090a](https://github.com/lupinum-dev/ginko-docs/commit/881090a))
- Keep sidebar top padding without a section switcher ([#8](https://github.com/lupinum-dev/ginko-docs/pull/8))
- Support consumer icon bundles ([50f2c2c](https://github.com/lupinum-dev/ginko-docs/commit/50f2c2c))
- Enable production analytics and feedback ([f90e12a](https://github.com/lupinum-dev/ginko-docs/commit/f90e12a))
- Close browser acceptance regressions ([410811c](https://github.com/lupinum-dev/ginko-docs/commit/410811c))

### Documentation

- Add Changelogen release notes ([76a9cc6](https://github.com/lupinum-dev/ginko-docs/commit/76a9cc6))
- Refresh release notes ([441b7ed](https://github.com/lupinum-dev/ginko-docs/commit/441b7ed))

### 🎨 Styles

- Format generated changelog ([66dd43f](https://github.com/lupinum-dev/ginko-docs/commit/66dd43f))

### ❤️ Contributors

- Mat4m0
- Matthias Amon
