const PAGE_FILE_EXTENSION = /\.[a-z0-9]+$/iu;

const EXCLUDED_PREFIXES = [
  "/api/",
  "/_nuxt/",
  "/_image/",
  "/raw/",
  "/mcp",
  "/.well-known/",
] as const;

const EXCLUDED_PATHS = new Set([
  "/favicon.ico",
  "/llms.txt",
  "/llms-full.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap_index.xml",
]);

function parseAccept(accept: string) {
  return accept
    .toLowerCase()
    .split(",")
    .map((item) => {
      const [rawType = "", ...parameters] = item.trim().split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const parsed = qualityParameter ? Number.parseFloat(qualityParameter.trim().slice(2)) : 1;
      return {
        type: rawType.trim(),
        quality: Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0,
      };
    });
}

function qualityFor(entries: ReturnType<typeof parseAccept>, mediaType: string) {
  const [targetType] = mediaType.split("/");
  const matches = entries.flatMap((entry) => {
    if (entry.type === mediaType) return [{ ...entry, specificity: 2 }];
    if (entry.type === `${targetType}/*`) return [{ ...entry, specificity: 1 }];
    if (entry.type === "*/*") return [{ ...entry, specificity: 0 }];
    return [];
  });
  if (!matches.length) return 0;

  const specificity = Math.max(...matches.map((entry) => entry.specificity));
  return matches
    .filter((entry) => entry.specificity === specificity)
    .reduce((maximum, entry) => Math.max(maximum, entry.quality), 0);
}

export function prefersMarkdown(accept: string | null) {
  if (!accept) return false;

  const entries = parseAccept(accept);
  if (!entries.some((entry) => entry.type === "text/markdown" && entry.quality > 0)) return false;

  const markdown = qualityFor(entries, "text/markdown");
  const html = Math.max(
    qualityFor(entries, "text/html"),
    qualityFor(entries, "application/xhtml+xml"),
  );
  return markdown > 0 && markdown >= html;
}

export function rawMarkdownPath(pathname: string) {
  if (
    EXCLUDED_PATHS.has(pathname) ||
    EXCLUDED_PREFIXES.some(
      (prefix) => pathname === prefix.slice(0, -1) || pathname.startsWith(prefix),
    ) ||
    PAGE_FILE_EXTENSION.test(pathname)
  ) {
    return null;
  }

  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/u, "") : pathname;
  return normalized === "/" ? "/raw/index.md" : `/raw${normalized}.md`;
}

export function withMarkdownHeaders(response: Response) {
  const headers = new Headers(response.headers);
  const vary = new Set(
    (headers.get("Vary") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  if (![...vary].some((value) => value.toLowerCase() === "accept")) vary.add("Accept");

  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", [...vary].join(", "));
  headers.set("X-Robots-Tag", "noindex");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function markdownNotFound(pathname: string) {
  return withMarkdownHeaders(
    new Response(
      `# Page not found\n\nNo public page exists at \`${pathname}\`.\n\n- [Agent index](/llms.txt)\n- [Documentation](/docs)\n`,
      { status: 404 },
    ),
  );
}
