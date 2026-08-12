import { defineNuxtModule } from "@nuxt/kit";

function componentDirectoryPath(entry: string | { path: string }) {
  return (typeof entry === "string" ? entry : entry.path).replaceAll("\\", "/");
}

export function isNuxtScriptsComponentDirectory(entry: string | { path: string }) {
  const path = componentDirectoryPath(entry);
  return (
    (path.includes("/node_modules/@nuxt/scripts/") || path.includes("/@nuxt+scripts@")) &&
    path.endsWith("/node_modules/@nuxt/scripts/dist/runtime/components")
  );
}

export default defineNuxtModule({
  meta: { name: "ginko-docs-analytics-boundary" },
  setup(_options, nuxt) {
    nuxt.hook("components:dirs", (dirs) => {
      const usedDirectories = dirs.filter((entry) => !isNuxtScriptsComponentDirectory(entry));
      dirs.splice(0, dirs.length, ...usedDirectories);
    });
  },
});
