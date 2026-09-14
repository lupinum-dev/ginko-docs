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
    flow: componentImplementationByName[ginkoDocsComponentTags.flow],
    figure: componentImplementationByName[ginkoDocsComponentTags.figure],
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
      flow: ginkoDocsComponentPolicy.components.flow,
      figure: ginkoDocsComponentPolicy.components.figure,
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
        size: { control: "select", label: "Text size" },
      },
      slots: { default: { label: "Quotation" } },
    },
    flow: {
      label: "Reading flow",
      description: "Readable prose with wider figures and optional wrapped images.",
      props: {
        width: { control: "select", label: "Text width" },
        surface: { control: "select", label: "Background" },
      },
      slots: { default: { label: "Article content" } },
    },
    figure: {
      label: "Figure",
      description: "An image with a caption and controlled framing.",
      props: {
        src: { control: "text", label: "Image source" },
        alt: { control: "text", label: "Image description" },
        caption: { control: "text", label: "Caption" },
        aspect: { control: "text", label: "Aspect ratio" },
        fit: { control: "text", label: "Image fit" },
        focus: { control: "select", label: "Crop focus" },
        placement: { control: "select", label: "Text wrapping" },
        frame: { control: "select", label: "Frame" },
        bleed: { control: "text", label: "Wider image" },
      },
      slots: { default: { label: "Description" } },
    },
    column: {
      label: "Column",
      description: "A responsive column inside a layout.",
      props: {
        size: { control: "select", label: "Width" },
        align: { control: "select", label: "Vertical alignment" },
        media: { control: "select", label: "Image sizing" },
      },
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
            { label: "Quarter / Three quarters", values: ["xs", "xl"], ratio: 1 / 4 },
            { label: "Three quarters / Quarter", values: ["xl", "xs"], ratio: 3 / 4 },
            { label: "Small / Large", values: ["sm", "lg"], ratio: 1 / 3 },
            { label: "Medium / Medium", values: ["md", "md"], ratio: 1 / 2 },
            { label: "Large / Small", values: ["lg", "sm"], ratio: 2 / 3 },
          ],
        },
      },
      props: {
        type: { control: "select", label: "Style" },
        align: { control: "select", label: "Vertical alignment" },
        gap: { control: "select", label: "Gap" },
        stack: { control: "select", label: "Stack below" },
        surface: { control: "select", label: "Background" },
      },
      slots: { default: { label: "Columns" } },
    },
  },
  recipes: [
    {
      id: "reading-flow",
      label: "Magazine article",
      description: "A reading column interrupted by a wider photograph.",
      source:
        '<Flow>\nIntroduce the story.\n<Figure src="/images/editorial/honeycomb.webp" alt="Bees on a honeycomb" caption="A closer look at the hive." bleed="outside" frame="none">\n</Figure>\nContinue the story.\n</Flow>',
    },
    {
      id: "wrapped-figure",
      label: "Wrapped photograph",
      description: "Text beside a small photograph, continuing below it.",
      source:
        '<Flow width="wide">\n<Figure src="/images/editorial/bee.webp" alt="Bee on a blossom" placement="end" frame="none">\n</Figure>\nWrite the passage here. Add enough text to continue below the image.\n</Flow>',
    },
    {
      id: "note",
      label: "Note",
      description: "Useful context alongside the main text.",
      keywords: ["callout"],
      source:
        '<Note title="Keep in mind" appearance="tint">\nWrite the important context here.\n</Note>',
    },
    {
      id: "warning",
      label: "Warning",
      description: "A condition readers should check before continuing.",
      keywords: ["callout"],
      source:
        '<Warning title="Before you continue" appearance="tint">\nWrite the important context here.\n</Warning>',
    },
    {
      id: "error",
      label: "Error",
      description: "Explain a failure and how to recover.",
      keywords: ["callout"],
      source:
        '<Error title="Something needs attention" appearance="tint">\nWrite the important context here.\n</Error>',
    },
    {
      id: "success",
      label: "Success",
      description: "Confirm an outcome or a completed step.",
      keywords: ["callout"],
      source:
        '<Success title="You are ready" appearance="tint">\nWrite the important context here.\n</Success>',
    },
    {
      id: "idea",
      label: "Idea",
      description: "A suggestion worth exploring.",
      keywords: ["callout"],
      source:
        '<Idea title="Try a different approach" appearance="tint">\nWrite the important context here.\n</Idea>',
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
        '<Excerpt label="In their words" source="Source">\nWrite the quoted passage here.\n</Excerpt>',
    },
    {
      id: "information",
      keywords: ["callout", "info"],
      label: "Information",
      source:
        '<Info title="Keep it focused" appearance="tint">\nState the important context.\n</Info>',
    },
    {
      id: "two-columns",
      label: "Two columns",
      source:
        '<Layout type="border">\n<Column size="sm">\nFirst column.\n</Column>\n<Column size="lg">\nSecond column.\n</Column>\n</Layout>',
    },
  ],
} as const;
