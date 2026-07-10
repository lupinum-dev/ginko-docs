<script setup lang="ts">
import { useI18n } from "#imports";
import HomeGridMotionSection from "./HomeGridMotionSection.vue";

const { t } = useI18n();
</script>

<template>
  <section class="overflow-hidden bg-hero-bg px-4 py-10 sm:px-8 sm:py-14 lg:py-16">
    <div
      class="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12"
    >
      <div class="max-w-2xl lg:max-w-none">
        <h1
          class="text-4xl leading-[1.04] font-bold tracking-normal text-gray-950 sm:text-5xl lg:text-6xl dark:text-hero-white"
        >
          {{ t("pages.home.hero.headline") }}
        </h1>

        <p
          class="mt-7 max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-hero-white/70"
        >
          {{ t("pages.home.hero.subline") }}
        </p>

        <div class="mt-8">
          <div class="flex flex-wrap gap-4 max-sm:flex-col">
            <NuxtLink
              to="#kontakt"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-hero-yellow px-6 py-4 text-center text-base font-semibold text-gray-900 transition-[transform,filter] duration-200 ease-out hover:-translate-y-0.5 hover:brightness-95 sm:px-7"
            >
              {{ t("pages.home.hero.primary") }}
              <Icon name="lucide:arrow-right" class="size-5" aria-hidden="true" />
            </NuxtLink>

            <NuxtLink
              to="#referenzen"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-gray-900/10 px-6 py-4 text-base font-semibold text-gray-800 transition-colors hover:border-gray-900/20 hover:bg-white dark:border-white/15 dark:text-hero-white dark:hover:border-white/25 dark:hover:bg-white/10"
            >
              {{ t("pages.home.hero.secondary") }}
              <Icon name="lucide:arrow-right" class="size-5" aria-hidden="true" />
            </NuxtLink>
          </div>

          <p class="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-hero-white/70">
            <Icon
              name="lucide:circle-check"
              class="size-4 shrink-0 text-hero-check"
              aria-hidden="true"
            />
            {{ t("pages.home.hero.promise") }}
          </p>
        </div>
      </div>

      <div class="relative min-w-0">
        <div
          class="h-[320px] overflow-hidden rounded-panel sm:h-[420px] md:h-[460px] lg:h-[580px] xl:h-[620px]"
        >
          <HomeGridMotionSection />
        </div>
      </div>
    </div>
  </section>
</template>
