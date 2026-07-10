import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const imageRoot = join(root, "public/images");
const checkedExtensions = new Set([".json", ".md", ".ts", ".vue", ".yml"]);
const scannedDirs = ["app", "content", "i18n", "nuxt.config.ts", "README.md"];

function walk(dir) {
  if (statSync(dir).isFile()) return [dir];

  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return [path];
  });
}

function extension(path) {
  return path.slice(path.lastIndexOf("."));
}

const sources = scannedDirs
  .flatMap((path) =>
    walk(join(root, path)).filter((file) => checkedExtensions.has(extension(file))),
  )
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

const unreferencedImages = walk(imageRoot)
  .map((file) => `/images/${relative(imageRoot, file).replaceAll("\\", "/")}`)
  .filter((path) => !sources.includes(path));

if (unreferencedImages.length) {
  console.error("Unreferenced public images:");
  for (const image of unreferencedImages) console.error(`- ${image}`);
  process.exit(1);
}

console.log("All public images are referenced.");
