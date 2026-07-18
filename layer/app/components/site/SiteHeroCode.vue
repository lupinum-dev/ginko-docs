<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useClipboard } from "@vueuse/core";
import { useAsyncData, useI18n } from "#imports";
import { cn } from "../../utils";
import { filenameExtension, resolveFileIcon } from "../../utils/file-icons";

export type SiteHeroCodeTab = {
  label: string;
  icon?: string;
  filename?: string;
  language?: string;
  code: string;
};

const props = defineProps<{ tabs: SiteHeroCodeTab[] }>();

const { copy, copied } = useClipboard();
const { t } = useI18n();
const regionId = useId();
const activeIndex = ref(0);

const activeTab = computed(() => props.tabs[activeIndex.value] ?? props.tabs[0]);

function tabIcon(tab: SiteHeroCodeTab): string {
  return tab.icon ?? resolveFileIcon(tab.filename);
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

function escapeHtml(input: string): string {
  return input.replace(/[&<>]/g, (char) => HTML_ESCAPES[char] ?? char);
}

function plainLines(code: string): string {
  return code
    .split("\n")
    .map((line) => `<span class="line">${escapeHtml(line)}</span>`)
    .join("");
}

// Config code arrives as raw strings, so it skips the build-time content
// pipeline; highlight here with the same Shiki themes the docs use.
const { data: highlighted } = await useAsyncData(`site-hero-code-${regionId}`, async () => {
  const { codeToHast, hastToHtml } = await import("shiki");

  return Promise.all(
    props.tabs.map(async (tab) => {
      const lang = tab.language ?? filenameExtension(tab.filename) ?? "text";

      try {
        const root = await codeToHast(tab.code, {
          lang,
          themes: { light: "light-plus", dark: "dark-plus" },
        });
        const pre = root.children.find((node) => node.type === "element");
        const code = pre?.children.find((node) => node.type === "element");
        if (!code) return plainLines(tab.code);

        return hastToHtml({ type: "root" as const, children: code.children });
      } catch {
        return plainLines(tab.code);
      }
    }),
  );
});

async function copyActiveCode() {
  await copy(activeTab.value?.code ?? "");
}
</script>

<template>
  <div class="site-hero-code content-codegroup not-prose group my-0 shadow-md">
    <div class="content-codegroup-header">
      <div v-if="tabs.length > 1" class="content-codegroup-tabs" role="tablist">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.label"
          type="button"
          role="tab"
          :aria-selected="activeIndex === index ? 'true' : 'false'"
          :class="
            cn('content-codegroup-tab', activeIndex === index && 'content-codegroup-tab-active')
          "
          @click="activeIndex = index"
        >
          <Icon :name="tabIcon(tab)" class="content-codegroup-tab-icon" aria-hidden="true" />
          {{ tab.label }}
        </button>
      </div>
      <div
        v-else-if="activeTab"
        class="flex min-w-0 items-center gap-1.5 text-[0.8125rem] font-medium text-muted-foreground"
      >
        <Icon :name="tabIcon(activeTab)" class="content-codegroup-tab-icon" aria-hidden="true" />
        <span class="truncate">{{ activeTab.label }}</span>
      </div>
      <button
        type="button"
        class="content-codeblock-copy-button content-codegroup-copy-button"
        :aria-label="copied ? t('docs.copiedText') : t('docs.copyText')"
        @click="copyActiveCode"
      >
        <Icon
          :name="copied ? 'lucide:check' : 'lucide:clipboard'"
          class="size-3.5"
          aria-hidden="true"
        />
      </button>
    </div>
    <div class="content-codegroup-panels grid">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.label"
        role="tabpanel"
        class="col-start-1 row-start-1 min-w-0"
        :class="activeIndex === index ? '' : 'invisible'"
        :inert="activeIndex !== index"
      >
        <figure
          dir="ltr"
          data-fd-codeblock
          class="content-codeblock group shiki not-prose content-codeblock-in-group relative"
        >
          <div
            role="region"
            tabindex="0"
            :aria-label="`${t('docs.codeSample')}: ${tab.label} (${regionId}-${index})`"
            class="fd-scroll-container max-h-[600px] overflow-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
          >
            <!-- Shiki output over site-owner config code, never end-user input. -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <pre
              class="w-max min-w-full"
            ><code v-html="highlighted?.[index] ?? plainLines(tab.code)" /></pre>
          </div>
        </figure>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hero-scale type: same chrome as docs code blocks, one step larger. */
.site-hero-code .content-codeblock pre {
  padding-top: 1rem;
  padding-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.75;
}

.site-hero-code :deep([data-fd-codeblock] pre code .line) {
  padding-right: 1.25rem;
  padding-left: 1.25rem;
}
</style>
