import { describe, expect, test } from "vitest";
import {
  markdownNotFound,
  prefersMarkdown,
  rawMarkdownPath,
  withMarkdownHeaders,
} from "./agent-routing";

describe("agent routing", () => {
  test.each([
    ["text/markdown", true],
    ["text/markdown, text/html;q=0.5", true],
    ["text/markdown, text/html", true],
    ["text/html, text/markdown;q=0.5", false],
    ["text/html;q=0.5, */*;q=0.8", false],
    ["text/html,application/xhtml+xml,*/*;q=0.8", false],
    ["*/*", false],
    ["text/markdown;q=0", false],
    [null, false],
  ])("chooses the preferred representation from %s", (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });

  test.each([
    ["/", "/raw/index.md"],
    ["/de", "/raw/de.md"],
    ["/docs/getting-started", "/raw/docs/getting-started.md"],
    ["/de/dokumentation/erste-schritte/", "/raw/de/dokumentation/erste-schritte.md"],
  ])("maps %s to its static Markdown route", (pathname, expected) => {
    expect(rawMarkdownPath(pathname)).toBe(expected);
  });

  test.each([
    "/api/search",
    "/_nuxt/app.js",
    "/raw/docs/getting-started.md",
    "/mcp",
    "/mcp/session",
    "/.well-known/mcp/server-card.json",
    "/llms.txt",
    "/sitemap.xml",
    "/favicon.ico",
    "/images/example.webp",
  ])("does not rewrite %s", (pathname) => {
    expect(rawMarkdownPath(pathname)).toBeNull();
  });

  test("preserves existing cache variance when serving Markdown", async () => {
    const response = withMarkdownHeaders(
      new Response("# Guide", { headers: { Vary: "Accept-Encoding" } }),
    );

    expect(response.headers.get("vary")).toBe("Accept-Encoding, Accept");
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(await response.text()).toBe("# Guide");
  });

  test("returns a recoverable real Markdown 404", async () => {
    const response = markdownNotFound("/missing");

    expect(response.status).toBe(404);
    expect(response.headers.get("vary")).toBe("Accept");
    expect(await response.text()).toContain("[Agent index](/llms.txt)");
  });
});
