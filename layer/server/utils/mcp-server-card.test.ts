import { describe, expect, test } from "vitest";
import { createGinkoDocsAiCatalog, createGinkoDocsServerCard } from "./mcp-server-card";

describe("MCP server card", () => {
  test("publishes absolute discovery and transport URLs", () => {
    const card = createGinkoDocsServerCard({
      origin: "https://docs.example.com",
      version: "1.2.3",
    });

    expect(card.name).toBe("dev.lupinum/ginko-docs");
    expect(card.version).toBe("1.2.3");
    expect(card.remotes).toEqual([
      {
        type: "streamable-http",
        url: "https://docs.example.com/mcp",
        supportedProtocolVersions: ["2025-11-25"],
      },
    ]);
    expect(card.websiteUrl).toBe("https://docs.example.com/docs/features/agent-readable-output");
    expect(card).not.toHaveProperty("tools");
  });

  test("publishes the server card through the domain AI catalog", () => {
    expect(createGinkoDocsAiCatalog("https://docs.example.com")).toEqual({
      specVersion: "1.0",
      entries: [
        {
          identifier: "urn:air:ginko-docs.lupinum.com:mcp:ginko-docs",
          displayName: "Ginko Docs MCP Server",
          type: "application/mcp-server-card+json",
          description: "Read the public Ginko Docs documentation through MCP.",
          url: "https://docs.example.com/mcp/server-card",
        },
      ],
    });
  });
});
