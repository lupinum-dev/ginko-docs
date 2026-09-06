import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    // Oxfmt does not understand YAML frontmatter nested inside MDC containers
    // and rewrites valid component syntax. Content has parser/build checks.
    ignorePatterns: [
      "docs/content/**/*.md",
      // Preserve the reviewed Lupinum OSS shared asset byte-for-byte.
      "scripts/check-dependency-policy.mjs",
    ],
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      // Agent worktrees hold full repo copies without their own install.
      "**/.claude/**",
      "**/.{idea,git,cache,output,temp,nuxt}/**",
    ],
  },
  pack: {
    entry: ["layer/content.ts"],
    outDir: "layer",
    format: ["esm"],
    platform: "node",
    clean: false,
    fixedExtension: false,
    hash: false,
    deps: {
      skipNodeModulesBundle: true,
    },
  },
});
