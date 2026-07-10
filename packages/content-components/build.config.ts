import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  failOnWarn: false,
  entries: [
    "src/module",
    "src/tags",
    {
      builder: "mkdist",
      input: "src/runtime",
      outDir: "dist/runtime",
      ext: "js",
    },
  ],
});
