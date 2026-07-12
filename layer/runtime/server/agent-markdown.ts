import {
  registerAgentMarkdownSerializers,
  type AgentMarkdownSerializer,
  type AgentMarkdownSerializerMap,
} from "@lupinum/ginko-content/agent-registry";
import { contentComponentTags } from "../../tags";

const renderXmlComponent: AgentMarkdownSerializer = (node, ctx) =>
  ctx.xmlComponent(node.tag || "component", ctx.cleanProps(node), ctx.renderChildren(node));

export const contentComponentAgentMarkdownTags = Object.keys(contentComponentTags);

export function registerContentComponentAgentMarkdownSerializers() {
  const serializers: AgentMarkdownSerializerMap = {};
  for (const [tag, component] of Object.entries(contentComponentTags)) {
    serializers[tag] = renderXmlComponent;
    serializers[component] = renderXmlComponent;
  }

  registerAgentMarkdownSerializers(serializers);
}
