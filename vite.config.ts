import { defineConfig } from "vite-plus";

export default defineConfig({
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
