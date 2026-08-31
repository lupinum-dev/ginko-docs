import { useAppConfig } from "#imports";
import { createGinkoDocsAiCatalog } from "../../utils/mcp-server-card";

export default defineEventHandler((event) => {
  event.node.res.setHeader("access-control-allow-origin", "*");
  event.node.res.setHeader("cache-control", "public, max-age=3600");
  event.node.res.setHeader("content-type", "application/ai-catalog+json; charset=utf-8");

  return createGinkoDocsAiCatalog(useAppConfig().ginkoDocs.site.url);
});
