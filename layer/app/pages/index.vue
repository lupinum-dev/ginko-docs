<script setup lang="ts">
import { computed } from "vue";
import { useAppConfig, useI18n, useSeoMeta } from "#imports";
import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";

const config = useAppConfig().ginkoDocs;
const { locale } = useI18n();
const localize = (value: string | { en: string; de?: string }) =>
  getLocalizedSiteText(value, locale.value);
const landing = computed(() => ({
  eyebrow: config.landing.eyebrow ? localize(config.landing.eyebrow) : undefined,
  title: localize(config.landing.title),
  description: localize(config.landing.description),
  primary: {
    label: localize(config.landing.primary.label),
    to: localize(config.landing.primary.to),
  },
  secondary: config.landing.secondary
    ? {
        label: localize(config.landing.secondary.label),
        to: localize(config.landing.secondary.to),
      }
    : undefined,
  features: config.landing.features.map((feature) => ({
    ...feature,
    title: localize(feature.title),
    description: localize(feature.description),
  })),
}));

useSeoMeta({
  title: computed(() => localize(config.site.name)),
  description: computed(() => localize(config.site.description)),
});
</script>

<template>
  <div class="overflow-hidden">
    <section class="relative border-b border-border">
      <div class="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <p v-if="landing.eyebrow" class="mb-6 text-sm font-semibold tracking-wide text-primary">
          {{ landing.eyebrow }}
        </p>
        <h1
          class="max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-7xl lg:text-[5.75rem]"
        >
          {{ landing.title }}
        </h1>
        <p class="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          {{ landing.description }}
        </p>
        <div class="mt-10 flex flex-wrap items-center gap-3">
          <NuxtLink
            :to="landing.primary.to"
            class="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
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
      </div>
    </section>

    <section v-if="landing.features.length" class="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div
        class="grid gap-12 border-t border-border pt-12 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border"
      >
        <article
          v-for="feature in landing.features"
          :key="feature.title"
          class="min-w-0 md:px-9 md:first:pl-0 md:last:pr-0"
        >
          <Icon
            v-if="feature.icon"
            :name="feature.icon"
            class="size-6 text-primary"
            aria-hidden="true"
          />
          <h2 class="mt-8 text-xl font-semibold tracking-tight text-foreground">
            {{ feature.title }}
          </h2>
          <p class="mt-3 leading-7 text-muted-foreground">{{ feature.description }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
