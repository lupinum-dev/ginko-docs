<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { useAsyncData, useI18n, useRuntimeConfig } from "#imports";
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

const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const syntaxThemes = computed(() => {
  const themes = runtimeConfig.public.ginkoDocs?.syntaxHighlighting?.themes;
  return {
    light: themes?.light ?? "light-plus",
    dark: themes?.dark ?? "dark-plus",
  };
});
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
// pipeline; highlight here with the configured Shiki theme pair.
const { data: highlighted } = await useAsyncData(`site-hero-code-${regionId}`, async () => {
  const { codeToHast, hastToHtml } = await import("shiki");
  const themes = syntaxThemes.value;

  return Promise.all(
    props.tabs.map(async (tab) => {
      const lang = tab.language ?? filenameExtension(tab.filename) ?? "text";

      try {
        const root = await codeToHast(tab.code, {
          lang,
          themes,
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
        class="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <Icon :name="tabIcon(activeTab)" class="content-codegroup-tab-icon" aria-hidden="true" />
        <span class="truncate">{{ activeTab.label }}</span>
      </div>
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
            <!-- eslint-disable vue/no-v-html -->
            <pre
              class="w-max min-w-full"
            ><code v-html="highlighted?.[index] ?? plainLines(tab.code)" /></pre>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </figure>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hero scale: same chrome as docs code groups, one step larger. */
.site-hero-code {
  padding: 0.25rem 0.375rem 0.375rem;
}

.site-hero-code .content-codegroup-header {
  padding: 0.375rem 0.375rem 0.25rem 0.625rem;
}

.site-hero-code .content-codegroup-tabs {
  gap: 0.375rem;
}

.site-hero-code .content-codegroup-tab {
  height: 2.125rem;
  gap: 0.5rem;
  padding: 0 0.625rem 0.4375rem;
  font-size: 0.9375rem;
}

.site-hero-code .content-codegroup-tab-icon {
  width: 1rem;
  height: 1rem;
}

.site-hero-code .content-codeblock pre {
  padding-top: 1.125rem;
  padding-bottom: 1.125rem;
  font-size: 0.875rem;
  line-height: 1.75;
}

.site-hero-code :deep([data-fd-codeblock] pre code .line) {
  padding-right: 1.5rem;
  padding-left: 1.5rem;
}
</style>
