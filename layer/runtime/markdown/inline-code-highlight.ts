import type { ComarkElement, ComarkNode, ComarkPluginFactory } from "comark";
import { getHighlighter, type HighlightOptions } from "comark/plugins/highlight";
import { codeToTokens, getTokenStyleObject, stringifyTokenStyle } from "shiki/core";

type CodeAttributes = {
  class?: string;
  lang?: string;
  language?: string;
};

type ThemeRegistration = NonNullable<NonNullable<HighlightOptions["themes"]>["light"]>;

type CodeThemes = {
  light: ThemeRegistration;
  dark: ThemeRegistration;
};

function cloneTheme<T extends ThemeRegistration>(theme: T): T {
  return structuredClone(theme);
}

async function resolveCodeThemes(themes?: HighlightOptions["themes"]): Promise<CodeThemes> {
  if (themes?.light || themes?.dark) {
    const light = themes.light || themes.dark;
    const dark = themes.dark || themes.light;

    return {
      light: cloneTheme(light as ThemeRegistration),
      dark: cloneTheme(dark as ThemeRegistration),
    };
  }

  const [light, dark] = await Promise.all([
    import("shiki/dist/themes/material-theme-lighter.mjs"),
    import("shiki/dist/themes/material-theme-palenight.mjs"),
  ]);

  return {
    light: cloneTheme(light.default),
    dark: cloneTheme(dark.default),
  };
}

function getThemeName(theme: ThemeRegistration, fallback: string): string {
  return typeof theme === "object" &&
    theme !== null &&
    "name" in theme &&
    typeof theme.name === "string"
    ? theme.name
    : fallback;
}

function isElement(node: ComarkNode): node is ComarkElement {
  return Array.isArray(node) && typeof node[0] === "string";
}

function getCodeLanguage(attrs: CodeAttributes): string | undefined {
  const language = attrs.language ?? attrs.lang;

  return language?.trim() || undefined;
}

function appendClass(attrs: CodeAttributes, className: string): CodeAttributes {
  return {
    ...attrs,
    class: [attrs.class, className].filter(Boolean).join(" "),
  };
}

async function highlightInlineCodeNode(
  node: ComarkElement,
  options: HighlightOptions,
): Promise<ComarkElement> {
  const attrs = (node[1] ?? {}) as CodeAttributes;
  const language = getCodeLanguage(attrs);
  const code = node
    .slice(2)
    .filter((child): child is string => typeof child === "string")
    .join("");

  if (!language || !code) {
    return node;
  }

  const themes = await resolveCodeThemes(options.themes);
  const lightThemeName = getThemeName(themes.light, "material-theme-lighter");
  const darkThemeName = getThemeName(themes.dark, "material-theme-palenight");
  const highlighter = await getHighlighter({
    ...options,
    registerDefaultThemes: false,
    themes,
  });
  const result = codeToTokens(highlighter, code, {
    lang: language,
    themes: {
      light: lightThemeName,
      dark: lightThemeName !== darkThemeName ? darkThemeName : undefined,
    },
  });
  const children: ComarkNode[] = [];

  for (let lineIndex = 0; lineIndex < result.tokens.length; lineIndex += 1) {
    const line = result.tokens[lineIndex] ?? [];

    for (const token of line) {
      const style = stringifyTokenStyle(token.htmlStyle || getTokenStyleObject(token));
      children.push(style ? ["span", { style }, token.content] : ["span", {}, token.content]);
    }

    if (lineIndex < result.tokens.length - 1) {
      children.push("\n");
    }
  }

  return [
    "code",
    appendClass(attrs, `shiki ${result.themeName || ""} language-${language}`.trim()),
    ...children,
  ];
}

async function highlightInlineCodeChildren(
  parent: ComarkElement,
  options: HighlightOptions,
): Promise<void> {
  const insidePre = parent[0] === "pre";

  for (let index = 2; index < parent.length; index += 1) {
    const child = parent[index] as ComarkNode;

    if (!isElement(child)) {
      continue;
    }

    if (!insidePre && child[0] === "code") {
      parent[index] = await highlightInlineCodeNode(child, options);
      continue;
    }

    await highlightInlineCodeChildren(child, options);
  }
}

const inlineCodeHighlightPlugin: ComarkPluginFactory<HighlightOptions> = (options = {}) => ({
  name: "inline-code-highlight",
  async post(state) {
    for (const node of state.tree.nodes) {
      if (isElement(node)) {
        await highlightInlineCodeChildren(node, options);
      }
    }
  },
});

export default inlineCodeHighlightPlugin;
