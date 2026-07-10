<script setup lang="ts">
import { useI18n } from "#imports";
import { useHomeMessageList } from "./home-content";

const { t } = useI18n();

const offers = useHomeMessageList("offers.items");

const iconStyles = {
  mint: "bg-hero-mint-muted",
  yellow: "bg-hero-yellow-muted",
  coral: "bg-hero-coral-muted",
  blue: "bg-hero-blue-muted",
} as const;

const iconNames = {
  mint: "material-symbols:manage-search-rounded",
  yellow: "material-symbols:design-services-rounded",
  coral: "material-symbols:rocket-launch-rounded",
  blue: "material-symbols:trending-up-rounded",
} as const;

const iconColors = {
  mint: "text-hero-mint-dark",
  yellow: "text-hero-yellow-dark",
  coral: "text-hero-coral",
  blue: "text-hero-blue",
} as const;

const checkClasses = {
  mint: "text-hero-mint-dark",
  yellow: "text-hero-yellow-dark",
  coral: "text-hero-coral",
  blue: "text-hero-blue",
} as const;

const durationBgClasses = {
  mint: "bg-hero-mint-muted",
  yellow: "bg-hero-yellow-muted",
  coral: "bg-hero-coral-muted",
  blue: "bg-hero-blue-muted",
} as const;
</script>

<template>
  <section id="angebot" class="scroll-mt-24 bg-white py-16 sm:py-24">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2
          class="mt-4 text-4xl leading-tight font-bold text-gray-950 sm:text-5xl dark:text-hero-white"
        >
          {{ t("pages.home.offers.headline") }}
        </h2>
      </div>

      <div class="mt-12 grid gap-6 sm:grid-cols-3">
        <article
          v-for="(offer, index) in offers"
          :key="offer.title"
          :class="[index === 3 ? 'sm:col-span-3' : '']"
          class="flex min-h-full flex-col rounded-section border-2 border-gray-100 bg-hero-bg p-6 sm:p-7 dark:bg-white/5"
        >
          <template v-if="index !== 3">
            <div>
              <span
                class="mb-6 flex size-11 items-center justify-center rounded-full"
                :class="iconStyles[offer.tone]"
                aria-hidden="true"
              >
                <Icon
                  :name="iconNames[offer.tone]"
                  :class="iconColors[offer.tone]"
                  style="width: 1.625rem; height: 1.625rem"
                />
              </span>

              <h3 class="text-2xl leading-tight font-bold text-gray-950 dark:text-hero-white">
                {{ offer.title }}
              </h3>

              <p class="mt-5 leading-relaxed text-gray-600 dark:text-hero-white/70">
                {{ offer.description }}
              </p>
            </div>

            <div class="mt-7">
              <ul class="space-y-3">
                <li
                  v-for="bullet in offer.bullets"
                  :key="bullet"
                  class="flex gap-3 text-sm leading-relaxed text-gray-700 dark:text-hero-white/75"
                >
                  <Icon
                    name="lucide:check-check"
                    class="mt-0.5 size-4 shrink-0"
                    :class="checkClasses[offer.tone]"
                    aria-hidden="true"
                  />
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </div>

            <div class="mt-auto pt-7">
              <div
                v-if="offer.duration"
                class="mb-5 rounded-card p-4"
                :class="durationBgClasses[offer.tone]"
              >
                <p
                  class="text-xs font-bold tracking-wide text-gray-700 uppercase dark:text-hero-white/80"
                >
                  {{ offer.durationLabel }}
                </p>
                <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-hero-white">
                  {{ offer.duration }}
                </p>
              </div>

              <NuxtLink
                to="#kontakt"
                class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-hero-white transition-transform duration-200 hover:-translate-y-0.5 dark:bg-hero-white dark:text-gray-950"
              >
                {{ offer.cta }}
                <Icon name="lucide:arrow-right" class="size-4" aria-hidden="true" />
              </NuxtLink>
            </div>
          </template>
          <template v-else>
            <div class="grid gap-8 sm:grid-cols-2">
              <div class="flex flex-col">
                <span
                  class="mb-6 flex size-11 items-center justify-center rounded-full"
                  :class="iconStyles[offer.tone]"
                  aria-hidden="true"
                >
                  <Icon
                    :name="iconNames[offer.tone]"
                    :class="iconColors[offer.tone]"
                    style="width: 1.625rem; height: 1.625rem"
                  />
                </span>

                <h3 class="text-2xl leading-tight font-bold text-gray-950 dark:text-hero-white">
                  {{ offer.title }}
                </h3>

                <p class="mt-5 leading-relaxed text-gray-600 dark:text-hero-white/70">
                  {{ offer.description }}
                </p>

                <div class="mt-auto pt-7">
                  <NuxtLink
                    to="#kontakt"
                    class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-hero-white transition-transform duration-200 hover:-translate-y-0.5 dark:bg-hero-white dark:text-gray-950"
                  >
                    {{ offer.cta }}
                    <Icon name="lucide:arrow-right" class="size-4" aria-hidden="true" />
                  </NuxtLink>
                </div>
              </div>

              <div class="flex flex-col justify-center">
                <ul class="mt-4 space-y-3">
                  <li
                    v-for="bullet in offer.bullets"
                    :key="bullet"
                    class="flex gap-3 text-sm leading-relaxed text-gray-700 dark:text-hero-white/75"
                  >
                    <Icon
                      name="lucide:check-check"
                      class="mt-0.5 size-4 shrink-0"
                      :class="checkClasses[offer.tone]"
                      aria-hidden="true"
                    />
                    <span>{{ bullet }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </article>
      </div>
    </div>
  </section>
</template>
