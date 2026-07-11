import { defineMcpTool } from "@nuxtjs/mcp-toolkit/server";
import { z } from "zod";

export default defineMcpTool({
  description: "Read a documentation page as Markdown.",
  annotations: { readOnlyHint: true },
  inputSchema: {
    path: z.string().startsWith("/").describe("Documentation path, for example /docs/introduction"),
  },
  handler: async ({ path }) => {
    const normalizedPath = path.replace(/\/$/, "");
    return await $fetch<string>(`/raw${normalizedPath}.md`, { responseType: "text" });
  },
});
