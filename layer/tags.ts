import type { PortableComponentPolicyV1 } from "@lupinum/ginko-content/cms-contract";

export const contentComponentTags = {
  accordion: "MdcAccordion",
  "accordion-item": "MdcAccordionItem",
  alert: "MdcAlert",
  aside: "MdcAside",
  callout: "MdcCallout",
  card: "MdcCard",
  "card-group": "MdcCardGroup",
  center: "MdcCenter",
  "code-group": "MdcCodeGroup",
  column: "MdcColumn",
  danger: "MdcError",
  "doc-img": "MdcDocImg",
  dropcap: "MdcDropcap",
  error: "MdcError",
  field: "MdcField",
  "field-group": "MdcFieldGroup",
  figure: "MdcFigure",
  idea: "MdcIdea",
  img: "ProseImg",
  info: "MdcInfo",
  layout: "MdcLayout",
  note: "MdcNote",
  passage: "MdcPassage",
  quiz: "MdcQuiz",
  "quiz-option": "MdcQuizOption",
  "quiz-question": "MdcQuizQuestion",
  "read-more": "MdcReadMore",
  "read-more-group": "MdcReadMoreGroup",
  shortcut: "MdcShortcut",
  step: "MdcStep",
  steps: "MdcSteps",
  success: "MdcSuccess",
  tab: "MdcTab",
  tabs: "MdcTabs",
  timeline: "MdcTimeline",
  "timeline-item": "MdcTimelineItem",
  warn: "MdcWarning",
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

const notice = block({ title: optional("string"), icon: optional("string") });

export const contentComponentPolicy = {
  components: {
    accordion: block({
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
    alert: block({
      title: optional("string"),
      icon: optional("string"),
      type: optional("string"),
    }),
    aside: block({ label: optional("string") }),
    callout: block({
      title: optional("string"),
      type: optional("string"),
      icon: optional("string"),
    }),
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
      },
      ["default", "title", "description", "footer"],
      { sourceProp: "img", altProp: null, titleProp: null, filenameProp: null },
    ),
    "card-group": block({ cols: optional("string") }),
    center: block({
      size: optional("string"),
      max: optional("string"),
      type: optional("string"),
    }),
    "code-group": block(),
    column: block({ size: optional("string") }),
    danger: notice,
    "doc-img": block({ bleed: optional("string") }),
    dropcap: block({ lines: optional("json") }),
    error: notice,
    field: block({
      name: required("string"),
      type: optional("string"),
      required: optional("boolean"),
      description: optional("string"),
      defaultValue: optional("string"),
    }),
    "field-group": block(),
    figure: block(
      {
        src: required("asset"),
        alt: required("string"),
        caption: optional("string"),
        width: optional("json"),
        height: optional("json"),
        bleed: optional("string"),
        aspect: optional("string"),
        fit: optional("string"),
      },
      ["default"],
      { sourceProp: "src", altProp: "alt", titleProp: null, filenameProp: null },
    ),
    idea: notice,
    info: notice,
    layout: block({ type: optional("string") }),
    note: notice,
    passage: block({ label: optional("string") }),
    quiz: block({
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
    "quiz-option": block({
      correct: optional("boolean"),
      label: optional("string"),
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
    "read-more": block(
      {
        title: optional("string"),
        to: required("string"),
        target: optional("string"),
        icon: optional("string"),
      },
      [],
    ),
    "read-more-group": block(),
    shortcut: inline({ value: optional("string"), size: optional("string") }),
    step: block({ title: optional("string"), icon: optional("string") }),
    steps: block({ variant: optional("string") }),
    success: notice,
    tab: block({ icon: optional("string"), label: optional("string") }),
    tabs: block({ variant: optional("string"), padded: optional("boolean") }),
    timeline: block(),
    "timeline-item": block({
      date: optional("string"),
      label: optional("string"),
      title: optional("string"),
    }),
    warn: notice,
    warning: notice,
  },
} satisfies PortableComponentPolicyV1;

export const contentComponentNames = Array.from(new Set(Object.values(contentComponentTags)));

export type ContentComponentTag = keyof typeof contentComponentTags;
export type ContentComponentName = (typeof contentComponentTags)[ContentComponentTag];
