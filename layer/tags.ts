import type { PortableComponentPolicyV1 } from "@lupinum/ginko-content/cms-contract";

export const contentComponentTags = {
  accordion: "MdcAccordion",
  "accordion-item": "MdcAccordionItem",
  api: "MdcApi",
  aside: "MdcAside",
  card: "MdcCard",
  cards: "MdcCards",
  center: "MdcCenter",
  "code-group": "MdcCodeGroup",
  "code-tree": "MdcCodeTree",
  collapse: "MdcCollapse",
  column: "MdcColumn",
  dropcap: "MdcDropcap",
  error: "MdcError",
  excerpt: "MdcExcerpt",
  figure: "MdcFigure",
  files: "MdcFiles",
  idea: "MdcIdea",
  img: "ProseImg",
  info: "MdcInfo",
  kbd: "MdcKbd",
  layout: "MdcLayout",
  note: "MdcNote",
  quiz: "MdcQuiz",
  "quiz-question": "MdcQuizQuestion",
  "read-more": "MdcReadMore",
  steps: "MdcSteps",
  success: "MdcSuccess",
  tab: "MdcTab",
  tabs: "MdcTabs",
  timeline: "MdcTimeline",
  "timeline-item": "MdcTimelineItem",
  toc: "MdcInlineToc",
  warning: "MdcWarning",
} as const;

type ComponentDefinition = PortableComponentPolicyV1["components"][string];
type ComponentProps = ComponentDefinition["props"];

const optional = (type: ComponentProps[string]["type"]) => ({ type, required: false });
const required = (type: ComponentProps[string]["type"]) => ({ type, required: true });
const block = (
  props: ComponentProps = {},
  slots: string[] = ["default"],
  media: ComponentDefinition["media"] = null,
): ComponentDefinition => ({ kind: "block", props, slots, media });
const inline = (props: ComponentProps = {}): ComponentDefinition => ({
  kind: "inline",
  props,
  slots: ["default"],
  media: null,
});

const appearance = { appearance: optional("string") };
const notice = block({ title: optional("string"), icon: optional("string"), ...appearance });

export const contentComponentPolicy = {
  components: {
    accordion: block({
      ...appearance,
      type: optional("string"),
      collapsible: optional("boolean"),
      defaultValue: optional("json"),
    }),
    "accordion-item": block(
      {
        value: optional("string"),
        title: optional("string"),
        content: optional("string"),
      },
      ["default", "title", "content"],
    ),
    api: block({
      ...appearance,
      title: optional("string"),
      icon: optional("string"),
      method: optional("string"),
      path: optional("string"),
      groups: optional("json"),
    }),
    aside: block({ label: optional("string"), ...appearance }),
    card: block(
      {
        title: optional("string"),
        description: optional("string"),
        footer: optional("string"),
        to: optional("string"),
        target: optional("string"),
        icon: optional("string"),
        iconColor: optional("string"),
        img: optional("asset"),
        showLinkIcon: optional("boolean"),
        horizontal: optional("boolean"),
        ...appearance,
      },
      ["default", "title", "description", "footer"],
      { sourceProp: "img", altProp: null, titleProp: null, filenameProp: null },
    ),
    cards: block({ cols: optional("string"), ...appearance }),
    center: block({
      size: optional("string"),
      max: optional("string"),
      type: optional("string"),
    }),
    "code-group": block(appearance),
    "code-tree": block({
      ...appearance,
      defaultValue: optional("string"),
      expandAll: optional("json"),
    }),
    collapse: block(appearance),
    column: block({ size: optional("string") }),
    dropcap: block({ lines: optional("json") }),
    error: notice,
    excerpt: block({ label: optional("string"), source: optional("string"), ...appearance }),
    figure: block(
      {
        ...appearance,
        src: required("asset"),
        alt: required("string"),
        caption: optional("string"),
        width: optional("json"),
        height: optional("json"),
        bleed: optional("string"),
        aspect: optional("string"),
        fit: optional("string"),
        zoom: optional("json"),
      },
      ["default"],
      { sourceProp: "src", altProp: "alt", titleProp: null, filenameProp: null },
    ),
    files: block({ active: optional("string"), annotations: optional("json"), ...appearance }),
    idea: notice,
    info: notice,
    kbd: inline(),
    layout: block({ type: optional("string") }),
    note: notice,
    quiz: block({
      ...appearance,
      title: optional("string"),
      description: optional("string"),
      questionLabel: optional("string"),
      backLabel: optional("string"),
      nextLabel: optional("string"),
      resultsLabel: optional("string"),
      correctSummaryLabel: optional("string"),
      perfectLabel: optional("string"),
      retryPrompt: optional("string"),
      resetLabel: optional("string"),
    }),
    "quiz-question": block({
      question: required("string"),
      type: optional("string"),
      explanation: optional("string"),
      options: optional("json"),
      checkLabel: optional("string"),
      correctLabel: optional("string"),
      incorrectLabel: optional("string"),
      resetLabel: optional("string"),
      multipleChoiceLabel: optional("string"),
    }),
    "read-more": block({ title: optional("string"), links: required("json"), ...appearance }, []),
    steps: block({ mode: optional("string"), ...appearance }),
    success: notice,
    tab: block({ icon: optional("string"), label: optional("string") }),
    tabs: block({ layout: optional("string"), padded: optional("boolean"), ...appearance }),
    timeline: block(appearance),
    "timeline-item": block({
      date: optional("string"),
      label: optional("string"),
      title: optional("string"),
      icon: optional("string"),
      active: optional("boolean"),
    }),
    toc: block(
      {
        title: optional("string"),
        depth: optional("json"),
        open: optional("json"),
      },
      [],
    ),
    warning: notice,
  },
} satisfies PortableComponentPolicyV1;

export const contentComponentNames = Array.from(new Set(Object.values(contentComponentTags)));

export type ContentComponentTag = keyof typeof contentComponentTags;
export type ContentComponentName = (typeof contentComponentTags)[ContentComponentTag];
