import {
  markdownNotFound,
  prefersMarkdown,
  rawMarkdownPath,
  withMarkdownHeaders,
} from "../../docs/agent-routing";

interface NetlifyContext {
  rewrite(path: string): Promise<Response>;
}

export async function routeNetlifyAgentRequest(request: Request, context: NetlifyContext) {
  const pathname = new URL(request.url).pathname;
  const rawPath = prefersMarkdown(request.headers.get("accept")) ? rawMarkdownPath(pathname) : null;
  if (!rawPath) return context.rewrite(pathname);

  const response = await context.rewrite(rawPath);
  if (response.status === 404) return markdownNotFound(pathname);
  if (!response.ok) return response;
  return withMarkdownHeaders(response);
}

export default routeNetlifyAgentRequest;
