import { setResponseHeaders } from "h3";
import { useAppConfig } from "#imports";
import packageMetadata from "../../../package.json" with { type: "json" };
import { createGinkoDocsServerCard } from "../../utils/mcp-server-card";

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=3600",
    "content-type": "application/mcp-server-card+json; charset=utf-8",
  });

  return createGinkoDocsServerCard({
    origin: useAppConfig().ginkoDocs.site.url,
    version: packageMetadata.version,
  });
});
