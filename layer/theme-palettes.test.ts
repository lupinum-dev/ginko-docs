import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { GINKO_DOCS_NEUTRAL_PALETTES, GINKO_DOCS_PRIMARY_PALETTES } from "./shared/theme-palettes";

const root = process.cwd();
const palettes = readFileSync(join(root, "layer/app/assets/css/theme-palettes.css"), "utf8");
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
    expect(plugin).toContain('"data-neutral": theme.neutral');
    expect(plugin).toContain('"data-primary": theme.primary');
    expect(landing).not.toMatch(/(?:bg|text)-zinc-/);
    expect(landing).toContain("bg-agent-background");
    expect(landing).toContain("text-emerald-300/90");
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

    expect(prose).toContain("--content-prose-inline-code-background: transparent");
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
