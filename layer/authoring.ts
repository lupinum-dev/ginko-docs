import { componentImplementationByName } from "./authoring.generated";
import { ginkoDocsComponentPolicy, ginkoDocsComponentTags } from "./components";

export const ginkoDocsAuthoringKitSource = {
  version: 1,
  implementation: {
    idea: componentImplementationByName[ginkoDocsComponentTags.idea],
    success: componentImplementationByName[ginkoDocsComponentTags.success],
    error: componentImplementationByName[ginkoDocsComponentTags.error],
    warning: componentImplementationByName[ginkoDocsComponentTags.warning],
    note: componentImplementationByName[ginkoDocsComponentTags.note],
    excerpt: componentImplementationByName[ginkoDocsComponentTags.excerpt],
    aside: componentImplementationByName[ginkoDocsComponentTags.aside],
    column: componentImplementationByName[ginkoDocsComponentTags.column],
    info: componentImplementationByName[ginkoDocsComponentTags.info],
    layout: componentImplementationByName[ginkoDocsComponentTags.layout],
  },
  policy: {
    version: 2,
    components: {
      idea: ginkoDocsComponentPolicy.components.idea,
      success: ginkoDocsComponentPolicy.components.success,
      error: ginkoDocsComponentPolicy.components.error,
      warning: ginkoDocsComponentPolicy.components.warning,
      note: ginkoDocsComponentPolicy.components.note,
      excerpt: ginkoDocsComponentPolicy.components.excerpt,
      aside: ginkoDocsComponentPolicy.components.aside,
      column: ginkoDocsComponentPolicy.components.column,
      info: ginkoDocsComponentPolicy.components.info,
      layout: ginkoDocsComponentPolicy.components.layout,
    },
  },
  authoring: {
    note: {
      label: "Note",
      description: "Useful context alongside the main text.",
      canvas: { titleProp: "title", switchGroup: "callout", tone: "neutral" },
      props: {
        icon: { control: "text", label: "Icon" },
        title: { control: "text", label: "Title" },
      },
      slots: { default: { label: "Content" } },
    },
    warning: {
      label: "Warning",
      description: "A condition readers should check before continuing.",
      canvas: { titleProp: "title", switchGroup: "callout", tone: "warning" },
      props: {
        icon: { control: "text", label: "Icon" },
        title: { control: "text", label: "Title" },
      },
      slots: { default: { label: "Content" } },
    },
    error: {
      label: "Error",
      description: "Explain a failure and how to recover.",
      canvas: { titleProp: "title", switchGroup: "callout", tone: "danger" },
      props: {
        icon: { control: "text", label: "Icon" },
        title: { control: "text", label: "Title" },
      },
      slots: { default: { label: "Content" } },
    },
    success: {
      label: "Success",
      description: "Confirm an outcome or a completed step.",
      canvas: { titleProp: "title", switchGroup: "callout", tone: "success" },
      props: {
        icon: { control: "text", label: "Icon" },
        title: { control: "text", label: "Title" },
      },
      slots: { default: { label: "Content" } },
    },
    idea: {
      label: "Idea",
      description: "A suggestion worth exploring.",
      canvas: { titleProp: "title", switchGroup: "callout", tone: "idea" },
      props: {
        icon: { control: "text", label: "Icon" },
        title: { control: "text", label: "Title" },
      },
      slots: { default: { label: "Content" } },
    },
    aside: {
      label: "Aside",
      description: "Additional context beside the main argument.",
      canvas: { titleProp: "label" },
      props: { label: { control: "text", label: "Label" } },
      slots: { default: { label: "Content" } },
    },
    excerpt: {
      label: "Excerpt",
      description: "A quoted passage with a source.",
      canvas: { titleProp: "label" },
      props: {
        label: { control: "text", label: "Label" },
        source: { control: "text", label: "Source" },
      },
      slots: { default: { label: "Quotation" } },
    },
    column: {
      label: "Column",
      description: "A responsive column inside a layout.",
      props: { size: { control: "select", label: "Width" } },
      slots: { default: { label: "Content" } },
    },
    info: {
      label: "Information",
      description: "Supporting information that readers should notice.",
      canvas: { titleProp: "title", switchGroup: "callout", tone: "info" },
      props: {
        appearance: { control: "select", label: "Appearance" },
        icon: { control: "text", label: "Icon" },
        title: { control: "text", label: "Title" },
      },
      slots: { default: { label: "Content" } },
    },
    layout: {
      label: "Layout",
      description: "A responsive row for related columns.",
      canvas: {
        columns: {
          childTag: "column",
          sizeProp: "size",
          presets: [
            { label: "Small / Large", values: ["sm", "lg"], ratio: 1 / 3 },
            { label: "Medium / Medium", values: ["md", "md"], ratio: 1 / 2 },
            { label: "Large / Small", values: ["lg", "sm"], ratio: 2 / 3 },
          ],
        },
      },
      props: { type: { control: "select", label: "Style" } },
      slots: { default: { label: "Columns" } },
    },
  },
  recipes: [
    {
      id: "note",
      label: "Note",
      description: "Useful context alongside the main text.",
      keywords: ["callout"],
      source:
        '<note title="Keep in mind" appearance="tint">\nWrite the important context here.\n</note>',
    },
    {
      id: "warning",
      label: "Warning",
      description: "A condition readers should check before continuing.",
      keywords: ["callout"],
      source:
        '<warning title="Before you continue" appearance="tint">\nWrite the important context here.\n</warning>',
    },
    {
      id: "error",
      label: "Error",
      description: "Explain a failure and how to recover.",
      keywords: ["callout"],
      source:
        '<error title="Something needs attention" appearance="tint">\nWrite the important context here.\n</error>',
    },
    {
      id: "success",
      label: "Success",
      description: "Confirm an outcome or a completed step.",
      keywords: ["callout"],
      source:
        '<success title="You are ready" appearance="tint">\nWrite the important context here.\n</success>',
    },
    {
      id: "idea",
      label: "Idea",
      description: "A suggestion worth exploring.",
      keywords: ["callout"],
      source:
        '<idea title="Try a different approach" appearance="tint">\nWrite the important context here.\n</idea>',
    },
    {
      id: "aside",
      label: "Aside",
      description: "Add context without interrupting the main text.",
      source: '<Aside label="A little context">\nAdd a useful detail here.\n</Aside>',
    },
    {
      id: "excerpt",
      label: "Excerpt",
      description: "Quote a passage and name its source.",
      keywords: ["quotation", "citation"],
      source:
        '<excerpt label="In their words" source="Source">\nWrite the quoted passage here.\n</excerpt>',
    },
    {
      id: "information",
      keywords: ["callout", "info"],
      label: "Information",
      source:
        '<info title="Keep it focused" appearance="tint">\nState the important context.\n</info>',
    },
    {
      id: "two-columns",
      label: "Two columns",
      source:
        '<layout type="border">\n<column size="sm">\nFirst column.\n</column>\n<column size="lg">\nSecond column.\n</column>\n</layout>',
    },
  ],
} as const;
