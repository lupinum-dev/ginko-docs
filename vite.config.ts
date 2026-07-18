import { defineConfig } from "vite-plus";

export default defineConfig({
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
