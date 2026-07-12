<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, ref } from "vue";
import { useClipboard } from "@vueuse/core";
import { useI18n } from "#imports";
import { cn } from "../../utils";

const props = defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: number[];
  meta?: string | null;
  icon?: string | null;
  inGroup?: boolean;
  class?: HTMLAttributes["class"];
}>();

const { copy, copied } = useClipboard();
const { t } = useI18n();
const codeElement = ref<HTMLElement | null>(null);

const HIDDEN_LANGUAGES = new Set(["text", "plaintext", "txt", "plain"]);
const FALLBACK_FILE_ICON = "lucide:file";

const FILENAME_ICONS: Record<string, string> = {
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

const EXTENSION_ICONS: Record<string, string> = {
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

const LANGUAGE_ICONS: Record<string, string> = {
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

function parseIconFromMeta(meta: string | null | undefined): string | null {
  if (!meta) return null;
  const match = meta.match(/(?:^|\s)icon=(\S+)/);
  return match?.[1] ?? null;
}

function normalizedFilename(filename: string | null | undefined): string | null {
  return filename?.trim().replace(/^\.\//, "").toLowerCase() || null;
}

function filenameExtension(filename: string | null | undefined): string | null {
  const normalized = normalizedFilename(filename);
  const basename = normalized?.split("/").pop();
  const index = basename?.lastIndexOf(".") ?? -1;

  if (!basename || index < 0 || index === basename.length - 1) return null;
  return basename.slice(index + 1);
}

function normalizedLanguage(language: string | null | undefined): string | null {
  return language?.trim().toLowerCase() || null;
}

const label = computed(() => {
  if (props.filename) return props.filename;

  const language = normalizedLanguage(props.language);
  if (language && !HIDDEN_LANGUAGES.has(language)) return props.language;

  return "";
});

const iconName = computed(() => {
  const explicitIcon = props.icon || parseIconFromMeta(props.meta);
  if (explicitIcon) return explicitIcon;

  const filename = normalizedFilename(props.filename);
  if (filename && FILENAME_ICONS[filename]) return FILENAME_ICONS[filename];

  const extension = filenameExtension(props.filename);
  if (extension && EXTENSION_ICONS[extension]) return EXTENSION_ICONS[extension];

  const language = normalizedLanguage(props.language);
  if (language && LANGUAGE_ICONS[language]) return LANGUAGE_ICONS[language];

  return FALLBACK_FILE_ICON;
});

async function copyCode() {
  await copy(props.code || codeElement.value?.innerText || "");
}
</script>

<template>
  <figure
    dir="ltr"
    data-fd-codeblock
    tabindex="-1"
    :class="
      cn(
        'content-codeblock group shiki not-prose relative',
        props.inGroup
          ? 'content-codeblock-in-group'
          : label
            ? 'content-codeblock-with-caption'
            : 'content-codeblock-plain',
      )
    "
  >
    <figcaption v-if="label && !props.inGroup" data-fd-caption>
      <Icon :name="iconName" mode="svg" class="content-codeblock-caption-icon" aria-hidden="true" />
      <span class="flex-1 truncate">{{ label }}</span>
      <button
        type="button"
        class="content-codeblock-copy-button ml-auto"
        :aria-label="copied ? t('docs.copiedText') : t('docs.copyText')"
        @click="copyCode"
      >
        <Icon
          :name="copied ? 'lucide:check' : 'lucide:clipboard'"
          mode="svg"
          class="size-3.5"
          aria-hidden="true"
        />
      </button>
    </figcaption>

    <div v-if="!label && !props.inGroup" class="absolute top-2 right-2 z-10" data-fd-copy-float>
      <button
        type="button"
        class="content-codeblock-copy-button content-codeblock-copy-button-floating"
        :aria-label="copied ? t('docs.copiedText') : t('docs.copyText')"
        @click="copyCode"
      >
        <Icon
          :name="copied ? 'lucide:check' : 'lucide:clipboard'"
          mode="svg"
          class="size-3.5"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      role="region"
      tabindex="0"
      :class="
        cn(
          'fd-scroll-container max-h-[600px] overflow-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset',
          !label && !props.inGroup && 'content-codeblock-inline-copy',
        )
      "
    >
      <pre
        ref="codeElement"
        :class="cn('w-max min-w-full', props.class)"
        v-bind="$attrs"
      ><slot /></pre>
    </div>
  </figure>
</template>
