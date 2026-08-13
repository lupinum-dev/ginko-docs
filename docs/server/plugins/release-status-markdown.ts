import {
  registerAgentMarkdownSerializers,
  type AgentMarkdownSerializer,
} from "@lupinum/ginko-content/agent-registry";
import { defineNitroPlugin } from "nitropack/runtime/plugin";

const releaseStatusMarkdown: AgentMarkdownSerializer = (node, context) => {
  const props = context.cleanProps(node);
  const channel = String(props.channel || "Unspecified");
  const availability = props.available === false ? "Unavailable" : "Available";
  const details = context.renderChildren(node).trim();

  return `> **${channel} release channel — ${availability}.**${details ? ` ${details}` : ""}`;
};

export default defineNitroPlugin(() => {
  registerAgentMarkdownSerializers({
    "release-status": releaseStatusMarkdown,
    MdcReleaseStatus: releaseStatusMarkdown,
  });
});
