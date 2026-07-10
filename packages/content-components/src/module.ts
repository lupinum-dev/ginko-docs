import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { addComponentsDir, addServerPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";
import { contentComponentTags } from "./tags";

type MarkdownPluginDescriptor = string | [string, Record<string, unknown>];

type NuxtWithContent = {
  options: {
    dev?: boolean;
    css?: string[];
    content?: {
      markdown?: {
        tags?: Record<string, string>;
        plugins?: MarkdownPluginDescriptor[];
      };
    };
  };
};

function resolveRuntimeRoot(
  nuxt: NuxtWithContent,
  resolver: ReturnType<typeof createResolver>,
): string {
  const builtRuntime = resolver.resolve("./runtime");

  if (!nuxt.options.dev) {
    return builtRuntime;
  }

  const packageRoot = fileURLToPath(new URL("..", import.meta.url));
  const sourceRuntime = join(packageRoot, "src/runtime");

  if (existsSync(join(sourceRuntime, "components/mdc"))) {
    return sourceRuntime;
  }

  return builtRuntime;
}

function markdownPluginName(plugin: MarkdownPluginDescriptor): string {
  return typeof plugin === "string" ? plugin : plugin[0];
}

function markdownPluginOptions(
  plugin: MarkdownPluginDescriptor,
): Record<string, unknown> | undefined {
  return typeof plugin === "string" ? undefined : plugin[1];
}

function findPluginOptions(
  plugins: MarkdownPluginDescriptor[],
  name: string,
): Record<string, unknown> | undefined {
  const plugin = plugins.find((candidate) => markdownPluginName(candidate) === name);

  return plugin ? markdownPluginOptions(plugin) : undefined;
}

function inlineCodeHighlightDescriptor(
  inlineCodeHighlightPlugin: string,
  highlightOptions: Record<string, unknown> | undefined,
): MarkdownPluginDescriptor {
  const themes = highlightOptions?.themes;

  if (!themes) {
    return inlineCodeHighlightPlugin;
  }

  return [inlineCodeHighlightPlugin, { themes }];
}

function withCodeHighlightPlugins(
  plugins: MarkdownPluginDescriptor[] | undefined,
  syntaxPlugin: string,
  inlineCodeHighlightPlugin: string,
): MarkdownPluginDescriptor[] {
  const existingPlugins = plugins ?? [];
  const pluginNames = new Set(existingPlugins.map(markdownPluginName));
  const resolvedPlugins = [...existingPlugins];
  const highlightOptions = findPluginOptions(existingPlugins, "highlight");

  if (!pluginNames.has("comark/plugins/syntax") && !pluginNames.has(syntaxPlugin)) {
    resolvedPlugins.unshift([
      syntaxPlugin,
      {
        blockComponent: false,
        inlineComponent: false,
        inlineProps: true,
        inlineSpan: false,
      },
    ]);
  }

  if (!pluginNames.has(inlineCodeHighlightPlugin)) {
    resolvedPlugins.push(
      inlineCodeHighlightDescriptor(inlineCodeHighlightPlugin, highlightOptions),
    );
  }

  return resolvedPlugins;
}

function resolveRuntimeModule(packageRoot: string, runtimeRoot: string, path: string): string {
  const builtModule = join(packageRoot, "dist/runtime", `${path}.js`);
  const sourceModule = join(runtimeRoot, `${path}.ts`);

  return pathToFileURL(existsSync(sourceModule) ? sourceModule : builtModule).href;
}

function resolveRuntimeFile(packageRoot: string, runtimeRoot: string, path: string): string {
  const builtModule = join(packageRoot, "dist/runtime", `${path}.js`);
  const sourceModule = join(runtimeRoot, `${path}.ts`);

  return existsSync(sourceModule) ? sourceModule : builtModule;
}

export { contentComponentNames, contentComponentTags } from "./tags";

export default defineNuxtModule({
  meta: {
    name: "@lupinum/content-components",
    configKey: "contentComponents",
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const packageRoot = fileURLToPath(new URL("..", import.meta.url));
    const runtimeRoot = resolveRuntimeRoot(nuxt as NuxtWithContent, resolver);
    const mdcComponentsPath = join(runtimeRoot, "components/mdc");
    const proseComponentsPath = join(runtimeRoot, "components/prose");
    const proseStylesPath = join(runtimeRoot, "styles/prose.css");
    const syntaxPlugin = import.meta.resolve("comark/plugins/syntax");
    const inlineCodeHighlightPlugin = resolveRuntimeModule(
      packageRoot,
      runtimeRoot,
      "markdown/inline-code-highlight",
    );
    const agentMarkdownPlugin = resolveRuntimeFile(
      packageRoot,
      runtimeRoot,
      "server/plugins/agent-markdown",
    );

    nuxt.options.css = nuxt.options.css ?? [];
    nuxt.options.css.push(proseStylesPath);

    addComponentsDir({
      path: mdcComponentsPath,
      global: true,
      pathPrefix: false,
    });

    addComponentsDir({
      path: proseComponentsPath,
      global: true,
      pathPrefix: false,
    });

    addServerPlugin(agentMarkdownPlugin);

    const contentOptions = (nuxt as NuxtWithContent).options.content ?? {};
    const markdownOptions = contentOptions.markdown ?? {};

    (nuxt as NuxtWithContent).options.content = {
      ...contentOptions,
      markdown: {
        ...markdownOptions,
        plugins: withCodeHighlightPlugins(
          markdownOptions.plugins,
          syntaxPlugin,
          inlineCodeHighlightPlugin,
        ),
        tags: {
          ...contentComponentTags,
          ...markdownOptions.tags,
        },
      },
    };
  },
});
