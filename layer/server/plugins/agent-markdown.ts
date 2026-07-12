import { defineNitroPlugin } from "nitropack/runtime/plugin";
import { registerContentComponentAgentMarkdownSerializers } from "../../runtime/server/agent-markdown";

export default defineNitroPlugin(() => {
  registerContentComponentAgentMarkdownSerializers();
});
