<script setup lang="ts">
import type { ComputedRef, HTMLAttributes } from "vue";
import { computed, inject, onMounted, ref, useId } from "vue";
import { useClipboard, useEventListener, useResizeObserver } from "@vueuse/core";
import { useI18n } from "#imports";
import { cn } from "../../utils";
import { useProseAppearance } from "../../composables/useProseAppearance";
import {
  EXTENSION_ICONS,
  FALLBACK_FILE_ICON,
  FILENAME_ICONS,
  LANGUAGE_ICONS,
  filenameExtension,
  normalizedFilename,
} from "../../utils/file-icons";

const props = defineProps<{
  code?: string;
  language?: string | null;
  filename?: string | null;
  highlights?: number[];
  meta?: string | null;
  icon?: string | null;
  inGroup?: boolean;
  class?: HTMLAttributes["class"];
  appearance?: "quiet" | "tint";
}>();
// Instance prop wins, then a surrounding ::collapse wrapper, then config.
const wrapperAppearance = inject<ComputedRef<"quiet" | "tint"> | null>(
  "contentCodeAppearance",
  null,
);
const appearance = useProseAppearance("code", () => props.appearance ?? wrapperAppearance?.value);

const { copy, copied } = useClipboard();
const { t } = useI18n();
const codeElement = ref<HTMLElement | null>(null);
// Landmarks with role="region" need unique accessible names; the same
// filename can appear in several code blocks on one page.
const regionId = useId();

const HIDDEN_LANGUAGES = new Set(["text", "plaintext", "txt", "plain"]);

function parseIconFromMeta(meta: string | null | undefined): string | null {
  if (!meta) return null;
  const match = meta.match(/(?:^|\s)icon=(\S+)/);
  return match?.[1] ?? null;
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

// A right-edge fade signals horizontally clipped code; it disappears once the
// reader reaches the end of the line.
const scrollElement = ref<HTMLElement | null>(null);
const canScrollRight = ref(false);

function measureOverflow() {
  const el = scrollElement.value;
  if (!el) return;
  canScrollRight.value =
    el.scrollWidth - el.clientWidth > 2 && el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
}

onMounted(measureOverflow);
useEventListener(scrollElement, "scroll", measureOverflow, { passive: true });
useResizeObserver(scrollElement, measureOverflow);
</script>

<template>
  <figure
    dir="ltr"
    data-fd-codeblock
    :data-appearance="appearance"
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

    <div class="content-codeblock-scroll-wrap">
      <div
        ref="scrollElement"
        role="region"
        tabindex="0"
        :aria-label="
          (label ? `${t('docs.codeSample')}: ${label}` : t('docs.codeSample')) + ` (${regionId})`
        "
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

      <div
        class="content-codeblock-overflow-fade"
        :data-hidden="!canScrollRight"
        aria-hidden="true"
      />
    </div>
  </figure>
</template>
