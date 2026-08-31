<script setup lang="ts">
import { computed } from "vue";
import { useClipboard } from "@vueuse/core";
import { useI18n, useSeoMeta } from "#imports";
import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";
import { useGinkoDocsConfig } from "#ginko-docs/composables/useGinkoDocsConfig";
import SiteHeroCode from "#ginko-docs/components/site/SiteHeroCode.vue";

const config = useGinkoDocsConfig();
const { locale, t } = useI18n();

type LocalizableText = string | { en: string; de?: string };
const localize = (value: LocalizableText) => getLocalizedSiteText(value, locale.value);
const localizeLink = (link: { label: LocalizableText; to: LocalizableText }) => ({
  label: localize(link.label),
  to: localize(link.to),
});

const landing = computed(() => ({
  title: localize(config.landing.title),
  description: localize(config.landing.description),
  primary: localizeLink(config.landing.primary),
  secondary: config.landing.secondary ? localizeLink(config.landing.secondary) : undefined,
  install: config.landing.install,
  features: config.landing.features.map((feature) => ({
    ...feature,
    title: localize(feature.title),
    description: localize(feature.description),
  })),
  heroMedia: config.landing.hero?.media,
  agent: config.landing.agent
    ? {
        title: localize(config.landing.agent.title),
        description: localize(config.landing.agent.description),
        code: config.landing.agent.code,
      }
    : undefined,
  cta: config.landing.cta
    ? {
        title: localize(config.landing.cta.title),
        primary: config.landing.cta.primary
          ? localizeLink(config.landing.cta.primary)
          : localizeLink(config.landing.primary),
        secondary: config.landing.cta.secondary
          ? localizeLink(config.landing.cta.secondary)
          : undefined,
      }
    : undefined,
}));

const heroCodeTabs = computed(() => {
  const media = landing.value.heroMedia;

  if (media?.type === "code-tabs") {
    return media.tabs.map((tab) => ({ ...tab, label: localize(tab.label) }));
  }

  if (media?.type === "code") {
    return [
      {
        label: media.filename ?? media.language ?? "Code",
        filename: media.filename,
        language: media.language,
        code: media.code,
      },
    ];
  }

  return [];
});

const hasWideHeroCode = computed(() => {
  const media = landing.value.heroMedia;
  return media?.type !== "image" && media?.layout === "wide";
});

// Feature icon tiles cycle through the theme-adaptive hero accent pairs.
const FEATURE_TINTS = [
  { tile: "bg-(--hero-blue-muted)", icon: "text-(--hero-blue-dark)" },
  { tile: "bg-(--hero-mint-muted)", icon: "text-(--hero-mint-text)" },
  { tile: "bg-(--hero-yellow-muted)", icon: "text-(--hero-yellow-dark)" },
  { tile: "bg-(--hero-coral-muted)", icon: "text-(--hero-coral-text)" },
];
const tint = (index: number) => FEATURE_TINTS[index % FEATURE_TINTS.length]!;

type TerminalLine = { kind: "command" | "comment" | "output"; text: string };
const agentTerminalLines = computed<TerminalLine[]>(() => {
  const code = landing.value.agent?.code;
  if (!code) return [];

  return code.split("\n").map((line) => ({
    kind: line.startsWith("$")
      ? "command"
      : line.trimStart().startsWith("#")
        ? "comment"
        : "output",
    text: line,
  }));
});

const { copy, copied } = useClipboard();
async function copyInstallCommand() {
  await copy(landing.value.install?.command ?? "");
}

const landingTitle = computed(() => localize(config.site.name));
const landingDescription = computed(() => localize(config.site.description));
useSeoMeta({
  title: landingTitle,
  description: landingDescription,
  ogTitle: landingTitle,
  ogDescription: landingDescription,
});
</script>

<template>
  <div class="overflow-hidden">
    <section class="relative border-b border-border">
      <div
        class="relative mx-auto flex max-w-6xl flex-col gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:flex-row lg:items-center"
      >
        <div class="min-w-0 flex-1">
          <h1
            class="max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-7xl"
            :class="landing.heroMedia ? 'lg:text-6xl' : 'lg:text-[5.75rem]'"
          >
            {{ landing.title }}
          </h1>
          <p class="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {{ landing.description }}
          </p>
          <div class="mt-10 flex flex-wrap items-center gap-3">
            <NuxtLink
              :to="landing.primary.to"
              class="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5"
            >
              {{ landing.primary.label }}
              <Icon name="lucide:arrow-right" class="size-4" aria-hidden="true" />
            </NuxtLink>
            <NuxtLink
              v-if="landing.secondary"
              :to="landing.secondary.to"
              class="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {{ landing.secondary.label }}
            </NuxtLink>
          </div>
          <div v-if="landing.install" class="mt-5">
            <div
              class="inline-flex h-10 max-w-full items-center gap-3 rounded-md border border-border bg-muted/40 pr-1.5 pl-4 font-mono text-[13px] text-foreground/90"
            >
              <span class="text-muted-foreground select-none" aria-hidden="true">$</span>
              <span class="truncate">{{ landing.install.command }}</span>
              <button
                type="button"
                class="content-codeblock-copy-button"
                :aria-label="copied ? t('docs.copiedText') : t('docs.copyText')"
                @click="copyInstallCommand"
              >
                <Icon
                  :name="copied ? 'lucide:check' : 'lucide:clipboard'"
                  class="size-3.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="landing.heroMedia"
          class="w-full min-w-0 max-w-2xl shrink-0 lg:w-[30rem] lg:max-w-full xl:w-[36rem]"
        >
          <NuxtImg
            v-if="landing.heroMedia.type === 'image'"
            :src="landing.heroMedia.src"
            :alt="landing.heroMedia.alt"
            class="w-full rounded-xl border border-border object-cover shadow-sm"
            width="576"
            loading="lazy"
          />
          <SiteHeroCode
            v-else-if="heroCodeTabs.length"
            :tabs="heroCodeTabs"
            :class="hasWideHeroCode && 'site-hero-code-wide'"
          />
        </div>
      </div>
    </section>

    <section v-if="landing.features.length" class="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(feature, index) in landing.features"
          :key="feature.title"
          class="min-w-0 rounded-lg border border-border bg-card p-6"
        >
          <span
            v-if="feature.icon"
            class="flex size-10 items-center justify-center rounded-md"
            :class="tint(index).tile"
          >
            <Icon
              :name="feature.icon"
              class="size-5"
              :class="tint(index).icon"
              aria-hidden="true"
            />
          </span>
          <h2 class="mt-5 text-base font-semibold tracking-tight text-foreground">
            {{ feature.title }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <section v-if="landing.agent" class="border-y border-border bg-agent-background">
      <div
        class="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16"
      >
        <div class="min-w-0">
          <h2
            class="text-3xl font-semibold tracking-[-0.03em] text-balance text-agent-foreground sm:text-4xl"
          >
            {{ landing.agent.title }}
          </h2>
          <p class="mt-4 max-w-xl text-base leading-7 text-agent-muted">
            {{ landing.agent.description }}
          </p>
        </div>
        <pre
          class="min-w-0 overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-5 font-mono text-[13px] leading-7"
        ><code><span
            v-for="(line, index) in agentTerminalLines"
            :key="index"
            class="block min-h-[1.75rem] whitespace-pre"
          ><template v-if="line.kind === 'command'"><span class="text-agent-muted/70 select-none">$</span><span class="text-agent-foreground">{{ line.text.slice(1) }}</span></template><span v-else-if="line.kind === 'comment'" class="text-emerald-300/90">{{ line.text }}</span><span v-else class="text-agent-muted">{{ line.text }}</span></span></code></pre>
      </div>
    </section>

    <section v-if="landing.cta">
      <div class="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <h2
          class="text-3xl font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-5xl"
        >
          {{ landing.cta.title }}
        </h2>
        <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            :to="landing.cta.primary.to"
            class="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-brand-foreground transition-transform hover:-translate-y-0.5"
          >
            {{ landing.cta.primary.label }}
            <Icon name="lucide:arrow-right" class="size-4" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink
            v-if="landing.cta.secondary"
            :to="landing.cta.secondary.to"
            class="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {{ landing.cta.secondary.label }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Keep the hero grid intact; only use spare space toward the viewport edge. */
@media (min-width: 80rem) {
  .site-hero-code-wide {
    width: min(48.75rem, calc(50vw - 2rem));
    max-width: none;
  }
}
</style>
