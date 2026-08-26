import { describe, expect, test } from "vitest";
import { routeCloudflareAgentRequest } from "./cloudflare-worker";
import { routeNetlifyAgentRequest } from "./netlify-edge";

function assetResponse(request: Request) {
  const pathname = new URL(request.url).pathname;
  if (pathname === "/raw/docs/start.md") {
    return new Response("# Start", {
      headers: { "Content-Type": "text/plain", Vary: "Accept-Encoding" },
    });
  }
  if (pathname === "/docs/start") {
    return new Response("<h1>Start</h1>", { headers: { "Content-Type": "text/html" } });
  }
  return new Response("missing", { status: 404 });
}

describe("static provider routing recipes", () => {
  test.each([
    [
      "Cloudflare",
      (request: Request) =>
        routeCloudflareAgentRequest(request, {
          ASSETS: { fetch: async (candidate) => assetResponse(candidate) },
        }),
    ],
    [
      "Netlify",
      (request: Request) =>
        routeNetlifyAgentRequest(request, {
          rewrite: async (path) => assetResponse(new Request(new URL(path, request.url))),
        }),
    ],
  ])("%s serves HTML by default and negotiated Markdown by bytes", async (_provider, handle) => {
    const html = await handle(new Request("https://docs.example.com/docs/start"));
    expect(html.headers.get("content-type")).toContain("text/html");

    const markdown = await handle(
      new Request("https://docs.example.com/docs/start", {
        headers: { Accept: "text/markdown, text/html;q=0.5" },
      }),
    );
    expect(markdown.status).toBe(200);
    expect(markdown.headers.get("content-type")).toContain("text/markdown");
    expect(markdown.headers.get("vary")).toContain("Accept-Encoding");
    expect(markdown.headers.get("vary")).toContain("Accept");
    expect(await markdown.text()).toBe("# Start");
  });

  test.each([
    [
      "Cloudflare",
      (request: Request) =>
        routeCloudflareAgentRequest(request, {
          ASSETS: { fetch: async (candidate) => assetResponse(candidate) },
        }),
    ],
    [
      "Netlify",
      (request: Request) =>
        routeNetlifyAgentRequest(request, {
          rewrite: async (path) => assetResponse(new Request(new URL(path, request.url))),
        }),
    ],
  ])("%s returns a useful Markdown 404", async (_provider, handle) => {
    const response = await handle(
      new Request("https://docs.example.com/missing", { headers: { Accept: "text/markdown" } }),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(await response.text()).toContain("[Agent index](/llms.txt)");
  });
});
