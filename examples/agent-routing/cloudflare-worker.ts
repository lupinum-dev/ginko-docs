import {
  markdownNotFound,
  prefersMarkdown,
  rawMarkdownPath,
  withMarkdownHeaders,
} from "../../docs/agent-routing";

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface CloudflareEnvironment {
  ASSETS: AssetsBinding;
}

export async function routeCloudflareAgentRequest(
  request: Request,
  environment: CloudflareEnvironment,
) {
  const url = new URL(request.url);
  const rawPath = prefersMarkdown(request.headers.get("accept"))
    ? rawMarkdownPath(url.pathname)
    : null;
  if (!rawPath) return environment.ASSETS.fetch(request);

  url.pathname = rawPath;
  const response = await environment.ASSETS.fetch(new Request(url, request));
  if (response.status === 404) return markdownNotFound(new URL(request.url).pathname);

  if (!response.ok) return response;
  return withMarkdownHeaders(response);
}

export default {
  fetch: routeCloudflareAgentRequest,
};
