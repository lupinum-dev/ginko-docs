import { defineMcpTool } from "@nuxtjs/mcp-toolkit/server";
import { agentRawPathForRoute } from "@lupinum/ginko-content/agent-paths";
import { z } from "zod";

export default defineMcpTool({
  description: "Read a documentation page as Markdown.",
  annotations: { readOnlyHint: true },
  inputSchema: {
    path: z.string().startsWith("/").describe("Documentation path, for example /docs/introduction"),
  },
  handler: async ({ path }) => {
    return await $fetch<string>(agentRawPathForRoute(path), { responseType: "text" });
  },
});
