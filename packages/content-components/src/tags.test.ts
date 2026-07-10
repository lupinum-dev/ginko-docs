import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { contentComponentNames, contentComponentTags } from "./tags";

const packageRoot = join(process.cwd(), "packages/content-components");

function readPackageFile(path: string) {
  return readFileSync(join(packageRoot, path), "utf8");
}

describe("@lupinum/content-components", () => {
  it("exports the generic content component tag map", () => {
    expect(contentComponentTags).toMatchObject({
      accordion: "MdcAccordion",
      "accordion-item": "MdcAccordionItem",
      alert: "MdcAlert",
      callout: "MdcCallout",
      danger: "MdcError",
      error: "MdcError",
      idea: "MdcIdea",
      img: "ProseImg",
      info: "MdcInfo",
      note: "MdcNote",
      "read-more": "MdcReadMore",
      step: "MdcStep",
      success: "MdcSuccess",
      tabs: "MdcTabs",
      warn: "MdcWarning",
      warning: "MdcWarning",
    });
    expect(contentComponentNames).toContain("MdcCard");
    expect(contentComponentNames.filter((name) => name === "MdcError")).toHaveLength(1);
    expect(contentComponentNames.filter((name) => name === "MdcWarning")).toHaveLength(1);
    expect(contentComponentTags).not.toHaveProperty("business-contact");
    expect(contentComponentTags).not.toHaveProperty("business-imprint");
    expect(contentComponentTags).not.toHaveProperty("privacy-services");
    expect(contentComponentTags).not.toHaveProperty("consent-embed");
  });

  it("registers mdc and prose components without owning content routes", () => {
    const source = readPackageFile("src/module.ts");

    expect(source).toContain("addComponentsDir");
    expect(source).toContain("addServerPlugin");
    expect(source).toContain("server/plugins/agent-markdown");
    expect(source).toContain("components/mdc");
    expect(source).toContain("components/prose");
    expect(source).toContain("styles/prose.css");
    expect(source).toContain("withCodeHighlightPlugins");
    expect(source).toContain("comark/plugins/syntax");
    expect(source).toContain("inline-code-highlight");
    expect(source).toContain("inlineProps: true");
    expect(source).toContain("...contentComponentTags");
    expect(source).toContain("...markdownOptions.tags");
    expect(source).not.toMatch(/routeRules|prerender|sitemap|i18n|collections|search/);
  });

  it("prefers source runtime files during local Nuxt development", () => {
    const source = readPackageFile("src/module.ts");

    expect(source).toContain("return sourceRuntime");
    expect(source).toContain("existsSync(sourceModule) ? sourceModule : builtModule");
  });

  it("covers all public component tags with agent markdown behavior", () => {
    const source = readPackageFile("src/runtime/server/agent-markdown.ts");
    const coverageSource =
      source.match(
        /export const contentComponentAgentMarkdownTags = \[([\s\S]*?)\] as const/,
      )?.[1] ?? "";
    const coveredTags = [...coverageSource.matchAll(/"([^"]+)"/g)].map((match) => match[1] ?? "");

    expect(new Set(coveredTags)).toEqual(new Set(Object.keys(contentComponentTags)));

    expect(source).toContain("renderXmlComponent");
    expect(source).toContain("ctx.xmlComponent");
    expect(source).toContain("let registered = false");
    expect(source).toContain("if (registered) return");
    expect(source).toContain("registerAgentMarkdownSerializers");
  });

  it("does not publish a duplicate shadcn primitive layer", () => {
    expect(existsSync(join(packageRoot, "src/runtime/components/ui"))).toBe(false);

    const runtimeFiles = [
      "src/runtime/components/mdc/MdcAccordion.vue",
      "src/runtime/components/mdc/MdcAccordionItem.vue",
      "src/runtime/components/mdc/MdcCallout.vue",
      "src/runtime/components/mdc/MdcCard.vue",
      "src/runtime/components/mdc/MdcCodeGroup.vue",
      "src/runtime/components/mdc/MdcField.vue",
      "src/runtime/components/mdc/MdcFieldGroup.vue",
      "src/runtime/components/mdc/MdcPassage.vue",
      "src/runtime/components/mdc/MdcQuiz.vue",
      "src/runtime/components/mdc/MdcQuizQuestion.vue",
      "src/runtime/components/mdc/MdcReadMore.vue",
      "src/runtime/components/mdc/MdcReadMoreGroup.vue",
      "src/runtime/components/mdc/MdcShortcut.vue",
      "src/runtime/components/mdc/MdcTabs.vue",
      "src/runtime/components/prose/ProsePre.vue",
    ];

    for (const file of runtimeFiles) {
      expect(readPackageFile(file)).not.toContain("../ui/");
    }
  });

  it("owns one compact prose rhythm without business components", () => {
    const proseCss = readPackageFile("src/runtime/styles/prose.css");
    const alert = readPackageFile("src/runtime/components/mdc/MdcAlert.vue");
    const callout = readPackageFile("src/runtime/components/mdc/MdcCallout.vue");
    const card = readPackageFile("src/runtime/components/mdc/MdcCard.vue");
    const error = readPackageFile("src/runtime/components/mdc/MdcError.vue");
    const idea = readPackageFile("src/runtime/components/mdc/MdcIdea.vue");
    const info = readPackageFile("src/runtime/components/mdc/MdcInfo.vue");
    const note = readPackageFile("src/runtime/components/mdc/MdcNote.vue");
    const readMore = readPackageFile("src/runtime/components/mdc/MdcReadMore.vue");
    const success = readPackageFile("src/runtime/components/mdc/MdcSuccess.vue");
    const warning = readPackageFile("src/runtime/components/mdc/MdcWarning.vue");
    const docImg = readPackageFile("src/runtime/components/mdc/MdcDocImg.vue");
    const steps = readPackageFile("src/runtime/components/mdc/MdcSteps.vue");
    const proseImg = readPackageFile("src/runtime/components/prose/ProseImg.vue");
    const proseParagraph = readPackageFile("src/runtime/components/prose/ProseP.vue");
    const proseCode = readPackageFile("src/runtime/components/prose/ProseCode.vue");
    const prosePre = readPackageFile("src/runtime/components/prose/ProsePre.vue");
    const inlineCodeHighlight = readPackageFile("src/runtime/markdown/inline-code-highlight.ts");
    const tabs = readPackageFile("src/runtime/components/mdc/MdcTabs.vue");
    const dropcap = readPackageFile("src/runtime/components/mdc/MdcDropcap.vue");
    const field = readPackageFile("src/runtime/components/mdc/MdcField.vue");
    const figure = readPackageFile("src/runtime/components/mdc/MdcFigure.vue");
    const layout = readPackageFile("src/runtime/components/mdc/MdcLayout.vue");
    const column = readPackageFile("src/runtime/components/mdc/MdcColumn.vue");
    const center = readPackageFile("src/runtime/components/mdc/MdcCenter.vue");
    const step = readPackageFile("src/runtime/components/mdc/MdcStep.vue");
    const table = readPackageFile("src/runtime/components/prose/ProseTable.vue");
    const timelineItem = readPackageFile("src/runtime/components/mdc/MdcTimelineItem.vue");
    const icons = readPackageFile("src/runtime/components/mdc/icons.ts");
    const proseHeadingComponents = [
      "src/runtime/components/prose/ProseH1.vue",
      "src/runtime/components/prose/ProseH2.vue",
      "src/runtime/components/prose/ProseH3.vue",
      "src/runtime/components/prose/ProseH4.vue",
    ];
    const proseRhythmComponents = [
      "src/runtime/components/prose/ProseBlockquote.vue",
      "src/runtime/components/prose/ProseOl.vue",
      "src/runtime/components/prose/ProseP.vue",
      "src/runtime/components/prose/ProseTable.vue",
      "src/runtime/components/prose/ProseTd.vue",
      "src/runtime/components/prose/ProseTh.vue",
      "src/runtime/components/prose/ProseThead.vue",
      "src/runtime/components/prose/ProseTr.vue",
      "src/runtime/components/prose/ProseUl.vue",
    ];

    expect(proseCss).toContain(".content-prose");
    expect(proseCss).toContain(".content-prose h1");
    expect(proseCss).toContain(".content-prose h2");
    expect(proseCss).toContain(".content-prose h3");
    expect(proseCss).toContain("font-size: 0.9375rem");
    expect(proseCss).toContain(".content-table");
    expect(proseCss).toContain(".content-media");
    expect(proseCss).toContain("--content-media-bleed-md: 2rem");
    expect(proseCss).toContain("--content-media-bleed-lg: 6rem");
    expect(proseCss).toContain("--content-media-bleed-xl: 12rem");
    expect(proseCss).toContain(".content-prose.content-prose-docs");
    expect(proseCss).toContain("--content-media-bleed-md: 1rem");
    expect(proseCss).toContain("--content-media-bleed-lg: 1.5rem");
    expect(proseCss).toContain("--content-media-bleed-xl: 2rem");
    expect(proseCss).toContain(
      '.content-media[data-bleed="true"],\n.content-doc-img[data-bleed="true"]',
    );
    expect(proseCss).toContain("calc(var(--content-media-bleed-xl) * -1)");
    expect(proseCss).toContain('.content-prose > p:has(> img[bleed="true"]:only-child)');
    expect(proseCss).toContain(".content-codeblock");
    expect(proseCss).toContain(".content-codeblock [data-fd-caption]");
    expect(prosePre).toContain("content-codeblock-caption-icon");
    expect(proseCss).toContain(".content-codeblock-caption-icon");
    expect(proseCss).toContain(".content-codegroup-tab-icon");
    expect(proseCss).toContain("font-size: 0.8125rem");
    expect(proseCss).toContain(".content-code");
    expect(proseCss).toContain(".content-code.shiki");
    expect(proseCss).toContain("--shiki-default");
    expect(inlineCodeHighlight).toContain('name: "inline-code-highlight"');
    expect(inlineCodeHighlight).toContain('child[0] === "code"');
    expect(inlineCodeHighlight).toContain('parent[0] === "pre"');
    expect(inlineCodeHighlight).toContain("codeToTokens");
    expect(inlineCodeHighlight).toContain("getHighlighter");
    expect(inlineCodeHighlight).toContain("language-${language}");
    expect(proseCss).toContain(".content-prose-trim");
    expect(proseCss).toContain(".content-steps");
    expect(proseCss).toContain(".fd-scroll-container");
    expect(proseCss).toContain("--shiki-dark");
    expect(proseCss).toContain("[data-fd-codeblock] pre code .line");
    expect(proseCss).toContain(".content-alert-title");
    expect(proseCss).toContain(".content-callout");
    expect(proseCss).not.toContain(".content-callout::before");
    expect(proseCss).toContain(".content-callout-icon");
    expect(proseCss).toContain(".content-callout-warning");
    expect(proseCss).toContain(".content-callout-error");
    expect(proseCss).toContain(".content-callout .content-prose");
    expect(proseCss).toContain(".content-callout .content-alert-title");
    expect(callout).toContain('data-slot="alert-icon"');
    expect(callout).toContain("content-callout-icon");
    expect(callout).toContain("content-callout-${normalizedType}");
    expect(alert).toContain("MdcCallout");
    expect(alert).not.toContain("../ui/alert/Alert.vue");
    expect(note).toContain("MdcCallout");
    expect(note).toContain('type="note"');
    expect(info).toContain('type="info"');
    expect(warning).toContain('type="warning"');
    expect(error).toContain('type="error"');
    expect(success).toContain('type="success"');
    expect(idea).toContain('type="idea"');
    expect(callout).toContain("type CalloutType");
    expect(callout).toContain('"alert"');
    expect(proseCss).toContain(".content-card-group > *");
    expect(proseCss).toContain(".content-prose :where(a.not-prose)");
    expect(proseCss).toContain("text-decoration-line: none");
    expect(proseCss).toContain(".not-prose) + :where(.not-prose)");
    expect(callout).toContain("content-callout");
    expect(callout).toContain('<slot unwrap="p" />');
    expect(docImg).toContain('props.bleed === "true"');
    expect(docImg).not.toContain("appConfig.content");
    expect(proseImg).toContain("bleed?: boolean | string");
    expect(proseImg).toContain("aspect?:");
    expect(proseImg).toContain("content-media not-prose");
    expect(proseImg).toContain(":data-bleed");
    expect(figure).toContain("bleed?: boolean | string");
    expect(figure).toContain("aspect?:");
    expect(steps).toContain('variant: "icons"');
    expect(step).toContain("content-step-title");
    expect(step).toContain("lucide:${icon}");
    expect(icons).toContain("resolveIconifyIcon");
    expect(icons).toContain('n.includes(":") ? n');
    expect(icons).toContain('`lucide:${n.replace(/_/g, "-").toLowerCase()}`');
    expect(callout).toContain("resolveIconifyIcon(props.icon)");
    expect(card).toContain("resolveIconifyIcon(props.icon)");
    expect(readMore).toContain("resolveIconifyIcon(props.icon)");
    expect(tabs).toContain("resolveIconifyIcon(icon)");
    expect(tabs).toContain('class: "content-tabs-tab-icon"');
    expect(proseCss).toContain(".content-tabs-tab-icon");
    expect(proseCss).toContain(".content-step-title");
    expect(proseParagraph).not.toContain("leading-7");
    expect(proseParagraph).not.toContain("my-4");
    expect(proseCode).toContain("content-code");
    expect(proseCss).toContain("display: inline");
    expect(proseCss).toContain("overflow-wrap: anywhere");
    expect(proseCss).toContain("white-space: normal");
    expect(proseCode).not.toContain("text-[0.875em]");
    expect(proseCode).not.toContain("font-mono");
    expect(proseCode).not.toContain("font-medium");
    expect(proseCode).not.toContain("py-0.5");
    expect(prosePre).toContain("FILENAME_ICONS");
    expect(prosePre).toContain("EXTENSION_ICONS");
    expect(prosePre).toContain("LANGUAGE_ICONS");
    expect(prosePre).toContain('"nuxt.config.ts": "logos:nuxt-icon"');
    expect(prosePre).toContain('ts: "logos:typescript-icon"');
    expect(prosePre).toContain('typescript: "logos:typescript-icon"');
    expect(prosePre).toContain('vue: "logos:vue"');
    expect(prosePre).toContain("FILENAME_ICONS[filename]");
    expect(prosePre).toContain("EXTENSION_ICONS[extension]");
    expect(prosePre).toContain("LANGUAGE_ICONS[language]");
    expect(prosePre).toContain("FALLBACK_FILE_ICON");
    expect(prosePre).toContain("content-codeblock");
    expect(prosePre).toContain("content-codeblock-in-group");
    expect(proseCss).toContain(".content-codegroup");
    expect(prosePre).not.toContain("my-6");
    expect(prosePre).not.toContain("text-card-foreground");
    expect(prosePre).toContain('mode="svg"');
    expect(proseCss).toContain("background-color: var(--background)");
    expect(proseCss).toContain("--content-prose-code-highlight-border: var(--code-border)");
    expect(field).not.toContain("prose-code:font-mono");
    expect(field).not.toContain("prose-code:text-sm");
    expect(field).not.toContain("prose-code:font-semibold");
    expect(field).not.toContain("py-[0.2rem]");
    expect(field).toContain("content-prose content-prose-trim");
    expect(field).toContain("font-sans font-normal");
    expect(layout).toContain('"outline" | "outline-dashed"');
    expect(layout).toContain("props.type?.value");
    expect(layout).toContain("layoutTypeValue");
    expect(layout).toContain("content-layout");
    expect(layout).toContain("'content-layout h-full'");
    expect(layout).toContain("content-layout-row");
    expect(layout).toContain("layoutTypeValue === 'card'");
    expect(layout).not.toContain("ginko-layout");
    expect(layout).not.toContain("border?:");
    expect(layout).not.toContain("color?:");
    expect(layout).toContain("outline-dashed");
    expect(column).toContain('type ColumnSize = "sm" | "md" | "lg"');
    expect(column).toContain("props.size?.value");
    expect(column).toContain("parentLayoutType");
    expect(column).toContain("columnSizeClass");
    expect(column).toContain('sm: "content-layout-column-sm"');
    expect(column).toContain('md: "content-layout-column-md"');
    expect(column).toContain('lg: "content-layout-column-lg"');
    expect(column).toContain("content-layout-column-divider");
    expect(column).toContain('class="content-layout-column-inner"');
    expect(proseCss).toContain(".content-layout-row");
    expect(proseCss).toContain("flex-direction: row");
    expect(proseCss).toContain(".content-layout-column-md");
    expect(center).toContain('type CenterSize = "sm" | "md" | "lg"');
    expect(center).toContain("props.size?.value");
    expect(center).toContain("centerTypeValue === 'card'");
    expect(center).toContain("centerSizeClass");
    expect(center).toContain("outline-dashed");
    expect(table).not.toContain("text-sm");
    expect(table).toContain("content-table");
    expect(timelineItem).toContain("content-prose content-prose-trim");
    expect(timelineItem).not.toContain("'text-sm leading-relaxed");
    expect(tabs).not.toContain("text-[0.9375rem]");
    expect(dropcap).not.toContain("[&>p]:text-base");
    expect(dropcap).not.toContain("[&>p]:leading-7");
    expect(steps).not.toContain("text-xl");
    expect(steps).not.toContain("font-size: 1.25rem");

    for (const file of proseHeadingComponents) {
      const source = readPackageFile(file);
      expect(source).not.toMatch(/\b(?:font-heading|font-semibold|tracking-tight)\b/);
      expect(source).not.toMatch(/\btext-(?:foreground|xl|base|sm|\[\d)/);
      expect(source).not.toMatch(/(?:^|[\s'"])(?:mt|mb|my)-\d/);
      expect(source).not.toMatch(/\bleading-/);
    }

    for (const file of proseRhythmComponents) {
      const source = readPackageFile(file);
      expect(source).not.toMatch(/(?:^|[\s'"])(?:mt|mb|my|px|py|pl|space-y)-\d/);
      expect(source).not.toMatch(/\b(?:text-muted-foreground|text-foreground|text-left)\b/);
      expect(source).not.toMatch(/\b(?:border-border|bg-muted|rounded-lg|shadow-xs)\b/);
    }
  });
});
