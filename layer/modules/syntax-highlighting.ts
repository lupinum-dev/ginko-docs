import { defineNuxtModule } from "@nuxt/kit";
import { bundledThemes } from "shiki";
import type { BundledTheme } from "shiki";
import type {
  GinkoDocsSyntaxHighlightingConfig,
  GinkoDocsNuxtConfig,
} from "../shared/types/nuxt-config";

export const DEFAULT_SYNTAX_THEMES = {
  light: "light-plus",
  dark: "dark-plus",
} as const satisfies GinkoDocsSyntaxHighlightingConfig["themes"];

type ShikiPluginOptions = {
  preStyles?: boolean;
  transformers?: unknown[];
  themes?: { light: unknown; dark: unknown };
};

type MarkdownPlugin = string | [string, Record<string, unknown>?];

export async function resolveBundledTheme(name: string, configPath: string) {
  const loader = bundledThemes[name as BundledTheme];
  if (!loader) {
    throw new Error(
      `Invalid Ginko Docs syntax theme "${name}".\n\nExpected a bundled Shiki theme name at:\n${configPath}`,
    );
  }

  const mod = await loader();
  return mod.default ?? mod;
}

export function findShikiPlugin(plugins: MarkdownPlugin[]) {
  for (let index = 0; index < plugins.length; index += 1) {
    const plugin = plugins[index];
    if (plugin === "shiki") {
      return { index, options: {} as ShikiPluginOptions };
    }
    if (Array.isArray(plugin) && plugin[0] === "shiki") {
      return { index, options: (plugin[1] ?? {}) as ShikiPluginOptions };
    }
  }
  return null;
}

export function countShikiPlugins(plugins: MarkdownPlugin[]) {
  return plugins.filter(
    (plugin) => plugin === "shiki" || (Array.isArray(plugin) && plugin[0] === "shiki"),
  ).length;
}

export async function patchShikiThemes(
  plugins: MarkdownPlugin[],
  themes: GinkoDocsSyntaxHighlightingConfig["themes"],
) {
  const shiki = findShikiPlugin(plugins);
  if (!shiki) {
    throw new Error("Ginko Docs could not locate the Shiki Markdown plugin to patch.");
  }

  const [light, dark] = await Promise.all([
    resolveBundledTheme(themes.light, "ginkoDocs.syntaxHighlighting.themes.light"),
    resolveBundledTheme(themes.dark, "ginkoDocs.syntaxHighlighting.themes.dark"),
  ]);

  shiki.options.themes = { light, dark };

  const plugin = plugins[shiki.index];
  if (Array.isArray(plugin)) {
    plugin[1] = shiki.options;
  } else {
    plugins[shiki.index] = ["shiki", shiki.options];
  }
}

export default defineNuxtModule<GinkoDocsNuxtConfig>({
  meta: {
    name: "ginko-docs-syntax-highlighting",
    configKey: "ginkoDocs",
  },
  async setup(options, nuxt) {
    const themes = options.syntaxHighlighting?.themes ?? DEFAULT_SYNTAX_THEMES;

    nuxt.options.runtimeConfig.public.ginkoDocs ??= {};
    nuxt.options.runtimeConfig.public.ginkoDocs.syntaxHighlighting = {
      themes: {
        light: themes.light,
        dark: themes.dark,
      },
    };

    if (!options.syntaxHighlighting) return;

    nuxt.options.content ??= {};
    nuxt.options.content.markdown ??= {};
    nuxt.options.content.markdown.plugins ??= [];

    await patchShikiThemes(
      nuxt.options.content.markdown.plugins as MarkdownPlugin[],
      options.syntaxHighlighting.themes,
    );
  },
});
