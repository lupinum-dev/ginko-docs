import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";
import { codeToHtml } from "shiki";
import darkPlus from "shiki/dist/themes/dark-plus.mjs";
import lightPlus from "shiki/dist/themes/light-plus.mjs";
import { describe, expect, it } from "vite-plus/test";
import {
  countShikiPlugins,
  DEFAULT_SYNTAX_THEMES,
  findShikiPlugin,
  patchShikiThemes,
  resolveBundledTheme,
} from "./modules/syntax-highlighting";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const sample = "const unchanged = true\nconst changed = true // [!code highlight]\n";

describe("syntax highlighting configuration", () => {
  it("keeps light-plus and dark-plus as the layer default", () => {
    const config = read("layer/nuxt.config.ts");
    expect(config).toContain('import lightPlus from "shiki/dist/themes/light-plus.mjs"');
    expect(config).toContain('import darkPlus from "shiki/dist/themes/dark-plus.mjs"');
    expect(config).toContain("themes: { light: lightPlus, dark: darkPlus }");
  });

  it("registers the syntax-highlighting module before Ginko Content", () => {
    const config = read("layer/nuxt.config.ts");
    const syntaxIndex = config.indexOf('join(root, "modules/syntax-highlighting")');
    const contentIndex = config.indexOf('"@lupinum/ginko-content"');
    expect(syntaxIndex).toBeGreaterThan(-1);
    expect(contentIndex).toBeGreaterThan(syntaxIndex);
  });

  it("resolves bundled Shiki themes and rejects unknown names", async () => {
    const light = await resolveBundledTheme(
      "material-theme-lighter",
      "ginkoDocs.syntaxHighlighting.themes.light",
    );
    expect(light).toBeTruthy();

    await expect(
      resolveBundledTheme("not-a-real-shiki-theme", "ginkoDocs.syntaxHighlighting.themes.dark"),
    ).rejects.toThrow(
      'Invalid Ginko Docs syntax theme "not-a-real-shiki-theme".\n\nExpected a bundled Shiki theme name at:\nginkoDocs.syntaxHighlighting.themes.dark',
    );
  });

  it("patches only the Shiki theme pair while preserving plugin options", async () => {
    const transformers = [transformerNotationDiff(), transformerNotationHighlight()];
    const plugins: Array<string | [string, Record<string, unknown>?]> = [
      [
        "shiki",
        {
          preStyles: false,
          transformers,
          themes: { light: lightPlus, dark: darkPlus },
        },
      ],
      ["toc", { depth: 4, searchDepth: 4 }],
      "summary",
    ];

    await patchShikiThemes(plugins, {
      light: "material-theme-lighter",
      dark: "material-theme-palenight",
    });

    expect(countShikiPlugins(plugins)).toBe(1);
    const shiki = findShikiPlugin(plugins);
    expect(shiki?.options.preStyles).toBe(false);
    expect(shiki?.options.transformers).toBe(transformers);
    expect(shiki?.options.themes?.light).not.toBe(lightPlus);
    expect(shiki?.options.themes?.dark).not.toBe(darkPlus);
  });

  it("generates different token colors for configured Material themes", async () => {
    const materialLight = await resolveBundledTheme(
      "material-theme-lighter",
      "ginkoDocs.syntaxHighlighting.themes.light",
    );
    const materialDark = await resolveBundledTheme(
      "material-theme-palenight",
      "ginkoDocs.syntaxHighlighting.themes.dark",
    );

    const defaultHtml = await codeToHtml(sample, {
      lang: "ts",
      themes: { light: lightPlus, dark: darkPlus },
    });
    const materialHtml = await codeToHtml(sample, {
      lang: "ts",
      themes: { light: materialLight, dark: materialDark },
    });

    expect(materialHtml).not.toBe(defaultHtml);
    expect(materialHtml).toContain("--shiki-light");
    expect(materialHtml).toContain("--shiki-dark");
  });

  it("exposes default syntax theme names for runtime hero highlighting", () => {
    expect(DEFAULT_SYNTAX_THEMES).toEqual({
      light: "light-plus",
      dark: "dark-plus",
    });
  });

  it("shows build-time syntax config on the docs landing hero", () => {
    const config = read("docs/app/app.config.ts");
    expect(config).toContain('filename: "nuxt.config.ts"');
    expect(config).toContain("syntaxHighlighting:");
    expect(config).toContain('light: "material-theme-lighter"');
    expect(config).toContain('dark: "material-theme-palenight"');
    expect(config).toContain('filename: "app.config.ts"');
    expect(config).toContain('codeBlocks: "adaptive"');
  });

  it("keeps highlight and diff transformers active after patching", async () => {
    const plugins: Array<string | [string, Record<string, unknown>?]> = [
      [
        "shiki",
        {
          preStyles: false,
          transformers: [transformerNotationDiff(), transformerNotationHighlight()],
          themes: { light: lightPlus, dark: darkPlus },
        },
      ],
    ];

    await patchShikiThemes(plugins, {
      light: "material-theme-lighter",
      dark: "material-theme-palenight",
    });

    const shiki = findShikiPlugin(plugins);
    const html = await codeToHtml(sample, {
      lang: "ts",
      themes: shiki!.options.themes as { light: typeof lightPlus; dark: typeof darkPlus },
      transformers: shiki!.options.transformers as (typeof transformerNotationHighlight)[],
    });

    expect(html).toContain("highlighted");
  });
});
