export function validateCodeTreePaths(paths: string[], defaultValue?: string): void {
  if (paths.length === 0) throw new TypeError("Code tree requires at least one labeled file");

  const seen = new Set<string>();
  for (const path of paths) {
    const parts = path.split("/");
    if (!path.trim() || parts.some((part) => !part.trim() || part === "." || part === "..")) {
      throw new TypeError(`Invalid code tree path "${path}"`);
    }
    if (seen.has(path)) throw new TypeError(`Duplicate code tree path "${path}"`);
    seen.add(path);
  }

  for (const path of paths) {
    if (paths.some((candidate) => candidate !== path && candidate.startsWith(`${path}/`))) {
      throw new TypeError(`Code tree file "${path}" is also used as a directory`);
    }
  }
  if (defaultValue !== undefined && !seen.has(defaultValue)) {
    throw new TypeError(`Code tree defaultValue does not match a file: "${defaultValue}"`);
  }
}
