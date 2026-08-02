import { defineEventHandler, setHeader } from "h3";
import { loadRedirectMap } from "../../utils/redirects";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * Prerender seed: returns a link page of every `redirectFrom` source so the
 * crawler visits each old path and materializes its redirect stub. Conflict
 * validation throws here, which fails the build via `failOnError`.
 */
export default defineEventHandler(async (event) => {
  const redirects = await loadRedirectMap(event);

  if (import.meta.prerender) {
    setHeader(event, "content-type", "text/html; charset=utf-8");
    const links = Array.from(redirects.keys())
      .map((source) => `<a href="${escapeHtml(source)}"></a>`)
      .join("");
    return `<!doctype html><html><head><meta charset="utf-8"></head><body>${links}</body></html>`;
  }

  return { count: redirects.size, redirects: Object.fromEntries(redirects) };
});
