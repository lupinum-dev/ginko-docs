import { next } from "@vercel/functions";
import {
  markdownNotFound,
  prefersMarkdown,
  rawMarkdownPath,
  withMarkdownHeaders,
} from "./agent-routing";

export const config = {
  matcher: "/((?!_nuxt/|_image/|api/|raw/|mcp(?:/|$)|\\.well-known/|.*\\.[^/]+$).*)",
};

export async function routeAgentMarkdown(request: Request, fetchRaw: typeof fetch) {
  if (!prefersMarkdown(request.headers.get("accept"))) return next();

  const url = new URL(request.url);
  const rawPath = rawMarkdownPath(url.pathname);
  if (!rawPath) return next();

  url.pathname = rawPath;
  const response = await fetchRaw(url, { signal: request.signal });
  if (response.status === 404) return markdownNotFound(new URL(request.url).pathname);
  if (!response.ok) return response;
  return withMarkdownHeaders(response);
}

export default function agentMarkdownRouting(request: Request) {
  return routeAgentMarkdown(request, fetch);
}
