import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { GINKO_DOCS_NEUTRAL_PALETTES, GINKO_DOCS_PRIMARY_PALETTES } from "./shared/theme-palettes";
import { GINKO_DOCS_THEME_PRESETS } from "./shared/theme-presets";

const root = process.cwd();
const palettes = readFileSync(join(root, "layer/app/assets/css/theme-palettes.css"), "utf8");
const presets = readFileSync(join(root, "layer/app/assets/css/theme-presets.css"), "utf8");
const tailwindTheme = readFileSync(join(root, "layer/node_modules/tailwindcss/theme.css"), "utf8");

function selectorValues(attribute: "neutral" | "primary") {
  return [...palettes.matchAll(new RegExp(`html\\[data-${attribute}="([a-z]+)"\\]`, "g"))].map(
    ([, value]) => value,
  );
}

function blockForPrimary(primary: string) {
  return palettes.match(
    new RegExp(`html\\[data-primary="${primary}"\\] \\{([\\s\\S]*?)\\n\\}`),
  )?.[1];
}

function variable(source: string, name: string) {
  return source.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
}

function hexRelativeLuminance(value: string) {
  const channels = value
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3)
    throw new Error(`Expected a hex color, received ${value}`);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
}

function hexContrast(first: string, second: string) {
  const light = Math.max(hexRelativeLuminance(first), hexRelativeLuminance(second));
  const dark = Math.min(hexRelativeLuminance(first), hexRelativeLuminance(second));
  return (light + 0.05) / (dark + 0.05);
}

function resolveTailwindColor(value: string) {
  const name = value.match(/^var\(--(color-[a-z]+-\d+)\)$/)?.[1];
  if (!name) throw new Error(`Expected a Tailwind color variable, received ${value}`);
  const resolved = variable(tailwindTheme, name);
  if (!resolved) throw new Error(`Tailwind does not define --${name}`);
  return resolved;
}

function relativeLuminance(value: string) {
  const match = value.match(/^oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)$/);
  if (!match) throw new Error(`Expected an opaque OKLCH color, received ${value}`);
  const lightness = Number(match[1]) / (value.includes("%") ? 100 : 1);
  const chroma = Number(match[2]);
  const hue = (Number(match[3]) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = Math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(lightness - 0.0894841775 * a - 1.291485548 * b, 3);
  const red = Math.min(1, Math.max(0, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s));
  const green = Math.min(1, Math.max(0, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s));
  const blue = Math.min(1, Math.max(0, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: string, second: string) {
  const light = Math.max(relativeLuminance(first), relativeLuminance(second));
  const dark = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (light + 0.05) / (dark + 0.05);
}

describe("theme palettes", () => {
  it("ships each public theme preset", () => {
    const selectors = [...presets.matchAll(/html\[data-theme-preset="([a-z]+)"\]/g)].map(
      ([, value]) => value,
    );
    expect([...new Set(["default", ...selectors])].sort()).toEqual(
      [...GINKO_DOCS_THEME_PRESETS].sort(),
    );
  });

  it("uses official Nuxt colors with accessible semantic pairs", () => {
    expect(variable(presets, "nuxt-green-400")).toBe("#00dc82");
    expect(variable(presets, "nuxt-green-700")).toBe("#007f45");
    expect(variable(presets, "brand")).toBe("var(--nuxt-green-400)");
    expect(variable(presets, "brand-foreground")).toBe("#020420");
    expect(variable(presets, "theme-primary-light")).toBe("var(--nuxt-green-700)");
    expect(hexContrast("#00dc82", "#020420")).toBeGreaterThanOrEqual(4.5);
    expect(hexContrast("#007f45", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps public palette names and CSS selectors aligned", () => {
    expect(selectorValues("neutral").sort()).toEqual(
      GINKO_DOCS_NEUTRAL_PALETTES.filter((name) => name !== "custom").sort(),
    );
    expect(selectorValues("primary").sort()).toEqual(
      GINKO_DOCS_PRIMARY_PALETTES.filter((name) => name !== "custom").sort(),
    );
  });

  it("accepts custom palettes without shipping opinionated custom values", () => {
    expect(GINKO_DOCS_NEUTRAL_PALETTES).toContain("custom");
    expect(GINKO_DOCS_PRIMARY_PALETTES).toContain("custom");
    expect(palettes).not.toContain('data-neutral="custom"');
    expect(palettes).not.toContain('data-primary="custom"');
    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(variable(palettes, `theme-neutral-${shade}`)).toBeTruthy();
    }
  });

  it("keeps every chromatic primary pair at WCAG AA contrast", () => {
    for (const primary of GINKO_DOCS_PRIMARY_PALETTES) {
      if (primary === "neutral" || primary === "custom") continue;
      const block = blockForPrimary(primary);
      expect(block, `${primary} must have a CSS block`).toBeTruthy();
      for (const mode of ["light", "dark"] as const) {
        const color = resolveTailwindColor(variable(block!, `theme-primary-${mode}`)!);
        const foreground = resolveTailwindColor(
          variable(block!, `theme-primary-${mode}-foreground`)!,
        );
        expect(contrast(color, foreground), `${primary} ${mode}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("ships the compatibility default and applies it during SSR", () => {
    const defaults = readFileSync(join(root, "layer/app/app.config.ts"), "utf8");
    const plugin = readFileSync(join(root, "layer/app/plugins/ginko-docs-theme.ts"), "utf8");
    const landing = readFileSync(join(root, "layer/app/pages/index.vue"), "utf8");

    expect(defaults).toContain('neutral: "zinc"');
    expect(defaults).toContain('primary: "neutral"');
    expect(defaults).toContain('preset: "default"');
    expect(defaults).toContain('codeBlocks: "dark"');
    expect(plugin).toContain('"data-neutral": theme.neutral');
    expect(plugin).toContain('"data-primary": theme.primary');
    expect(plugin).toContain('"data-theme-preset": theme.preset ?? "default"');
    expect(plugin).toContain('"data-code-blocks": theme.codeBlocks');
    expect(landing).not.toMatch(/(?:bg|text)-zinc-/);
    expect(landing).toContain("bg-agent-background");
    expect(landing).toContain("text-emerald-300/90");
    expect(landing).toContain("bg-brand");
  });

  it("keeps dark code blocks configurable without changing inline code", () => {
    const types = readFileSync(join(root, "layer/shared/types/app-config.ts"), "utf8");
    const prose = readFileSync(join(root, "layer/app/assets/css/prose.css"), "utf8");

    expect(types).toContain('GinkoDocsCodeBlockTheme = "dark" | "adaptive"');
    expect(types).toContain("codeBlocks: GinkoDocsCodeBlockTheme");
    expect(prose).toContain('html[data-code-blocks="dark"]');
    expect(prose).toContain(".content-codeblock, .content-codegroup, .content-code-tree");
    expect(prose).toContain('html[data-code-blocks="dark"] .content-codeblock.shiki span');
    expect(prose).toContain("color: var(--shiki-dark) !important");
    expect(prose).not.toContain('html[data-code-blocks="dark"] .content-code.shiki');
    expect(prose).not.toContain('html[data-code-blocks="adaptive"]');
  });

  it("keeps inline code and copy controls neutral", () => {
    const prose = readFileSync(join(root, "layer/app/assets/css/prose.css"), "utf8");
    const copyButton = prose.match(/\.content-codeblock-copy-button \{([\s\S]*?)\n\}/)?.[1];
    const copyButtonInteraction = prose.match(
      /\.content-codeblock-copy-button:hover,[\s\S]*?\{([\s\S]*?)\n\}/,
    )?.[1];
    const copyButtonFocus = prose.match(
      /\.content-codeblock-copy-button:focus-visible \{([\s\S]*?)\n\}/,
    )?.[1];

    expect(prose).toContain("--content-prose-inline-code-background: var(--background)");
    expect(copyButton).toContain("color: var(--muted-foreground)");
    expect(copyButton).not.toContain("var(--primary)");
    expect(copyButtonInteraction).toContain("color: var(--foreground)");
    expect(copyButtonInteraction).not.toContain("var(--primary)");
    expect(copyButtonFocus).toContain("var(--foreground)");
    expect(copyButtonFocus).not.toContain("var(--ring)");
  });

  it("applies the documentation app palettes with accessible primary pairs", () => {
    const config = readFileSync(join(root, "docs/app/app.config.ts"), "utf8");
    const custom = readFileSync(join(root, "docs/app/assets/css/theme.css"), "utf8");

    expect(config).toContain('neutral: "custom"');
    expect(config).toContain('primary: "custom"');
    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(variable(custom, `theme-neutral-${shade}`)).toBeTruthy();
    }
    for (const mode of ["light", "dark"] as const) {
      const color = variable(custom, `theme-primary-${mode}`);
      const foreground = variable(custom, `theme-primary-${mode}-foreground`);
      expect(contrast(color!, foreground!), `custom ${mode}`).toBeGreaterThanOrEqual(4.5);
      expect(variable(custom, `theme-primary-${mode}-ring`)).toBeTruthy();
    }
  });
});
