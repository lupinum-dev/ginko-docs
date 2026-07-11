import {
  registerAgentMarkdownSerializers,
  type AgentMarkdownSerializer,
  type AgentMarkdownSerializerMap,
} from "@lupinum/ginko-content/server";
import { contentComponentTags } from "../../tags";

const renderXmlComponent: AgentMarkdownSerializer = (node, ctx) =>
  ctx.xmlComponent(node.tag || "component", ctx.cleanProps(node), ctx.renderChildren(node));

const registerFor = (
  serializers: AgentMarkdownSerializerMap,
  tags: string[],
  serializer: AgentMarkdownSerializer,
) => {
  for (const tag of tags) {
    serializers[tag] = serializer;
    const mapped = contentComponentTags[tag as keyof typeof contentComponentTags];
    if (mapped) serializers[mapped] = serializer;
  }
};

export const contentComponentAgentMarkdownTags = [
  "card-group",
  "code-group",
  "tabs",
  "steps",
  "read-more-group",
  "field-group",
  "layout",
  "center",
  "column",
  "dropcap",
  "card",
  "callout",
  "alert",
  "note",
  "info",
  "warning",
  "warn",
  "danger",
  "error",
  "success",
  "idea",
  "aside",
  "passage",
  "tab",
  "step",
  "timeline-item",
  "accordion-item",
  "field",
  "read-more",
  "figure",
  "doc-img",
  "img",
  "accordion",
  "timeline",
  "quiz",
  "quiz-question",
  "quiz-option",
  "shortcut",
] as const;

let registered = false;

export function registerContentComponentAgentMarkdownSerializers() {
  if (registered) return;
  registered = true;

  const serializers: AgentMarkdownSerializerMap = {};

  registerFor(
    serializers,
    [
      "card-group",
      "code-group",
      "tabs",
      "steps",
      "read-more-group",
      "field-group",
      "center",
      "column",
      "dropcap",
    ],
    renderXmlComponent,
  );
  registerFor(serializers, ["layout"], renderXmlComponent);
  registerFor(serializers, ["card"], renderXmlComponent);
  registerFor(
    serializers,
    [
      "callout",
      "alert",
      "note",
      "info",
      "warning",
      "warn",
      "danger",
      "error",
      "success",
      "idea",
      "aside",
      "passage",
    ],
    renderXmlComponent,
  );
  registerFor(serializers, ["tab", "step", "timeline-item", "accordion-item"], renderXmlComponent);
  registerFor(serializers, ["field"], renderXmlComponent);
  registerFor(serializers, ["read-more"], renderXmlComponent);
  registerFor(serializers, ["figure", "doc-img", "img"], renderXmlComponent);
  registerFor(serializers, ["accordion", "timeline"], renderXmlComponent);
  registerFor(serializers, ["quiz"], renderXmlComponent);
  registerFor(serializers, ["quiz-question"], renderXmlComponent);
  registerFor(serializers, ["quiz-option"], renderXmlComponent);
  registerFor(serializers, ["shortcut"], renderXmlComponent);

  registerAgentMarkdownSerializers(serializers);
}
