import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    // Oxfmt does not understand YAML frontmatter nested inside MDC containers
    // and rewrites valid component syntax. Content has parser/build checks.
    ignorePatterns: ["AGENTS.md", "playground/content/**/*.md"],
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
