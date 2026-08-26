import { setResponseHeaders } from "h3";
import { useAppConfig } from "#imports";
import { createGinkoDocsAiCatalog } from "../../utils/mcp-server-card";

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=3600",
    "content-type": "application/ai-catalog+json; charset=utf-8",
  });

  return createGinkoDocsAiCatalog(useAppConfig().ginkoDocs.site.url);
});
