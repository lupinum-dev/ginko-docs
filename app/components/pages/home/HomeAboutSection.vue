<script setup lang="ts">
import { useI18n } from "#imports";
import { useHomeMessageList, type HomeBrandColor } from "./home-content";

const colorMap: Record<HomeBrandColor, { bg: string; icon: string }> = {
  yellow: { bg: "bg-hero-yellow-muted", icon: "text-hero-yellow-dark" },
  blue: { bg: "bg-hero-blue-muted", icon: "text-hero-blue-dark" },
  mint: { bg: "bg-hero-mint-muted", icon: "text-hero-mint-text" },
  coral: { bg: "bg-hero-coral-muted", icon: "text-hero-coral-text" },
};

const { t, rt } = useI18n();

const cards = useHomeMessageList("about.cards");
</script>

<template>
  <section class="bg-hero-bg py-16 sm:py-24">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div class="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
        <div class="lg:sticky lg:top-24">
          <h2
            class="mt-4 text-4xl leading-tight font-bold text-gray-950 sm:text-5xl dark:text-hero-white"
          >
            {{ t("pages.home.about.headline") }}
          </h2>

          <p class="mt-4 text-sm leading-relaxed text-gray-600 dark:text-hero-white/70">
            {{ t("pages.home.about.subline") }}
          </p>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="overflow-hidden rounded-2xl">
              <img
                src="/images/home/Matthias.png"
                alt="Matthias"
                class="h-full w-full object-cover object-top"
              />
            </div>
            <div class="overflow-hidden rounded-2xl">
              <img
                src="/images/home/Romi.png"
                alt="Romi"
                class="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <article
            v-for="(card, i) in cards"
            :key="i"
            class="group rounded-card border border-gray-100 bg-white p-6 shadow-sm"
          >
            <span
              class="flex size-11 items-center justify-center rounded-full transition-colors duration-300"
              :class="[colorMap[card.color].bg, colorMap[card.color].icon]"
            >
              <Icon
                :name="`lucide:${card.icon}`"
                style="width: 1.625rem; height: 1.625rem"
                aria-hidden="true"
              />
            </span>

            <h3 class="mt-6 text-xl leading-tight font-bold text-gray-950 dark:text-hero-white">
              {{ rt(card.title) }}
            </h3>

            <p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-hero-white/70">
              {{ rt(card.description) }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
