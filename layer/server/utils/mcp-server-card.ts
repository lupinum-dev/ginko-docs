export interface GinkoDocsServerCardOptions {
  origin: string;
  version: string;
}

export function createGinkoDocsServerCard({ origin, version }: GinkoDocsServerCardOptions) {
  const baseUrl = new URL(origin);

  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "dev.lupinum/ginko-docs",
    title: "Ginko Docs",
    version,
    description: "Read published Ginko Docs pages through its public MCP tools.",
    websiteUrl: new URL("/docs/features/agent-readable-output", baseUrl).toString(),
    repository: {
      source: "github",
      url: "https://github.com/lupinum-dev/ginko-docs",
    },
    remotes: [
      {
        type: "streamable-http",
        url: new URL("/mcp", baseUrl).toString(),
        supportedProtocolVersions: ["2025-11-25"],
      },
    ],
  } as const;
}

export function createGinkoDocsAiCatalog(origin: string) {
  const baseUrl = new URL(origin);

  return {
    specVersion: "1.0",
    entries: [
      {
        identifier: "urn:air:ginko-docs.lupinum.com:mcp:ginko-docs",
        displayName: "Ginko Docs MCP Server",
        type: "application/mcp-server-card+json",
        description: "Read the public Ginko Docs documentation through MCP.",
        url: new URL("/mcp/server-card", baseUrl).toString(),
      },
    ],
  } as const;
}
