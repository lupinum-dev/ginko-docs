import { useAppConfig } from "#imports";
import packageMetadata from "../../../package.json" with { type: "json" };
import { createGinkoDocsServerCard } from "../../utils/mcp-server-card";

export default defineEventHandler((event) => {
  event.node.res.setHeader("access-control-allow-origin", "*");
  event.node.res.setHeader("cache-control", "public, max-age=3600");
  event.node.res.setHeader(
    "content-type",
    "application/mcp-server-card+json; charset=utf-8",
  );

  return createGinkoDocsServerCard({
    origin: useAppConfig().ginkoDocs.site.url,
    version: packageMetadata.version,
  });
});
