import { defineMcpTool } from "@nuxtjs/mcp-toolkit/server";

export default defineMcpTool({
  description: "List the documentation pages available to agents.",
  annotations: { readOnlyHint: true },
  handler: async () => {
    const index = await $fetch<string>("/llms.txt", { responseType: "text" });
    return index;
  },
});
