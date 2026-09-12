import { componentImplementationByName } from "./authoring.generated";
import { ginkoDocsComponentPolicy, ginkoDocsComponentTags } from "./components";

export const ginkoDocsAuthoringKitSource = {
  version: 1,
  implementation: {
    column: componentImplementationByName[ginkoDocsComponentTags.column],
    info: componentImplementationByName[ginkoDocsComponentTags.info],
    layout: componentImplementationByName[ginkoDocsComponentTags.layout],
  },
  policy: {
    version: 2,
    components: {
      column: ginkoDocsComponentPolicy.components.column,
      info: ginkoDocsComponentPolicy.components.info,
      layout: ginkoDocsComponentPolicy.components.layout,
    },
  },
  authoring: {
    column: {
      label: "Column",
      description: "A responsive column inside a layout.",
      props: { size: { control: "select", label: "Width" } },
      slots: { default: { label: "Content" } },
    },
    info: {
      label: "Information",
      description: "Supporting information that readers should notice.",
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
      props: { type: { control: "select", label: "Style" } },
      slots: { default: { label: "Columns" } },
    },
  },
  recipes: [
    {
      id: "information",
      keywords: ["note", "callout", "info"],
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
