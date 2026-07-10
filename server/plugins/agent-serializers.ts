import { defineNitroPlugin } from "nitropack/runtime";
import { registerBusinessAgentMarkdownSerializers } from "../utils/agent-serializers";

export default defineNitroPlugin(() => {
  registerBusinessAgentMarkdownSerializers();
});
