import { defineEventHandler, sendRedirect } from "h3";
import { loadRedirectMap } from "../utils/redirects";
import { normalizeRedirectPath } from "../utils/redirects.utils";

/**
 * Serves authored `redirectFrom` moves as 301s. During prerender this runs
 * before the catch-all page would SSR a 404 for the crawled old path, so the
 * static build materializes the same meta-refresh stub the docs root uses.
 */
export default defineEventHandler(async (event) => {
  if (event.method !== "GET" && event.method !== "HEAD") return;

  const path = normalizeRedirectPath(event.path);
  const lastSegment = path.slice(path.lastIndexOf("/") + 1);
  if (path.startsWith("/api/") || path.startsWith("/_") || lastSegment.includes(".")) return;

  const redirects = await loadRedirectMap(event);
  const target = redirects.get(path);
  if (target) {
    return sendRedirect(event, target, 301);
  }
});
