import { describe, expect, test, vi } from "vitest";
import { routeAgentMarkdown } from "./middleware";

describe("Vercel agent routing middleware", () => {
  test("serves the generated Markdown bytes at the original page URL", async () => {
    const fetchRaw = vi.fn(
      async () =>
        new Response("# Getting started", {
          headers: { Vary: "Accept-Encoding" },
        }),
    );
    const response = await routeAgentMarkdown(
      new Request("https://docs.example.com/docs/getting-started", {
        headers: { Accept: "text/markdown, text/html;q=0.5" },
      }),
      fetchRaw as typeof fetch,
    );

    expect(fetchRaw).toHaveBeenCalledWith(
      new URL("https://docs.example.com/raw/docs/getting-started.md"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("vary")).toBe("Accept-Encoding, Accept");
    expect(await response.text()).toBe("# Getting started");
  });

  test("replaces a missing raw asset with a useful Markdown 404", async () => {
    const response = await routeAgentMarkdown(
      new Request("https://docs.example.com/unknown", {
        headers: { Accept: "text/markdown" },
      }),
      (async () => new Response("host 404", { status: 404 })) as typeof fetch,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(await response.text()).toContain("[Documentation](/docs)");
  });
});
