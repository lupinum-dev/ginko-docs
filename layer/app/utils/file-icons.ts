export const FALLBACK_FILE_ICON = "lucide:file";

export const FILENAME_ICONS: Record<string, string> = {
  ".env": "lucide:file-key",
  ".env.example": "lucide:file-key",
  ".gitignore": "lucide:git-branch",
  "components.json": "lucide:blocks",
  "eslint.config.cjs": "lucide:badge-check",
  "eslint.config.js": "lucide:badge-check",
  "eslint.config.mjs": "lucide:badge-check",
  "nuxt.config.js": "logos:nuxt-icon",
  "nuxt.config.ts": "logos:nuxt-icon",
  "package.json": "lucide:package",
  "pnpm-lock.yaml": "lucide:package",
  "pnpm-workspace.yaml": "lucide:package",
  "tailwind.config.js": "lucide:palette",
  "tailwind.config.ts": "lucide:palette",
  "tsconfig.json": "lucide:file-cog",
  "vite.config.js": "lucide:zap",
  "vite.config.ts": "lucide:zap",
};

export const EXTENSION_ICONS: Record<string, string> = {
  bash: "lucide:terminal",
  cjs: "lucide:file-json",
  css: "lucide:braces",
  csv: "lucide:table",
  htm: "lucide:code-xml",
  html: "lucide:code-xml",
  js: "lucide:file-json",
  json: "lucide:braces",
  jsx: "lucide:atom",
  md: "lucide:file-text",
  mdc: "lucide:file-text",
  mjs: "lucide:file-json",
  mts: "lucide:file-code",
  scss: "lucide:braces",
  sh: "lucide:terminal",
  ts: "logos:typescript-icon",
  tsx: "lucide:atom",
  txt: "lucide:file-text",
  vue: "logos:vue",
  yaml: "lucide:file-cog",
  yml: "lucide:file-cog",
};

export const LANGUAGE_ICONS: Record<string, string> = {
  bash: "lucide:terminal",
  css: "lucide:braces",
  html: "lucide:code-xml",
  javascript: "lucide:file-json",
  js: "lucide:file-json",
  json: "lucide:braces",
  jsx: "lucide:atom",
  markdown: "lucide:file-text",
  mdc: "lucide:file-text",
  shell: "lucide:terminal",
  sh: "lucide:terminal",
  ts: "logos:typescript-icon",
  tsx: "lucide:atom",
  typescript: "logos:typescript-icon",
  vue: "logos:vue",
  "vue-html": "logos:vue",
  yaml: "lucide:file-cog",
  yml: "lucide:file-cog",
};

export function normalizedFilename(filename: string | null | undefined): string | null {
  return filename?.trim().replace(/^\.\//, "").toLowerCase() || null;
}

export function filenameExtension(filename: string | null | undefined): string | null {
  const normalized = normalizedFilename(filename);
  const basename = normalized?.split("/").pop();
  const index = basename?.lastIndexOf(".") ?? -1;

  if (!basename || index < 0 || index === basename.length - 1) return null;
  return basename.slice(index + 1);
}

/** Best-effort icon for a file, by exact name first, then extension. */
export function resolveFileIcon(filename: string | null | undefined): string {
  const normalized = normalizedFilename(filename);
  if (normalized && FILENAME_ICONS[normalized]) return FILENAME_ICONS[normalized];

  const extension = filenameExtension(filename);
  if (extension && EXTENSION_ICONS[extension]) return EXTENSION_ICONS[extension];

  return FALLBACK_FILE_ICON;
}
