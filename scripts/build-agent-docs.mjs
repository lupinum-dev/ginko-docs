import { resolve } from "node:path";
import { buildPackageAgentDocs, verifyPackageAgentDocs } from "./package-agent-docs.mjs";

const root = resolve(import.meta.dirname, "..");
const packageRoot = resolve(root, "layer");
const sourceRoot = resolve(root, "docs/.output/public/raw");
await buildPackageAgentDocs({
  packageRoot,
  sourceRoot,
  startRoutes: ["/docs/getting-started/installation", "/docs/resources/public-exports"],
});
const manifest = await verifyPackageAgentDocs(packageRoot, { sourceRoot });
console.log(`Packaged ${manifest.pages.length} pages for ${manifest.name}@${manifest.version}.`);
