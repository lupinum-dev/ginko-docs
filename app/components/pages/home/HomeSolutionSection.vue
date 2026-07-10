<script setup lang="ts">
import { useI18n } from "#imports";
import { useHomeMessageList } from "./home-content";

const { t } = useI18n();

const principles = useHomeMessageList("solution.principles");

const tileStyles = [
  {
    iconBg: "bg-hero-blue-muted",
    iconColor: "text-hero-blue",
    icon: "material-symbols:article-rounded",
  },
  {
    iconBg: "bg-hero-mint-muted",
    iconColor: "text-hero-mint-dark",
    icon: "material-symbols:verified-rounded",
  },
  {
    iconBg: "bg-hero-yellow-muted",
    iconColor: "text-hero-yellow-dark",
    icon: "material-symbols:alt-route-rounded",
  },
  {
    iconBg: "bg-hero-coral-muted",
    iconColor: "text-hero-coral",
    icon: "material-symbols:campaign-rounded",
  },
] as const;

function tileStyle(index: number) {
  return tileStyles[index] ?? tileStyles[0];
}
</script>

<template>
  <section
    id="solution-section"
    class="scroll-mt-24 bg-white py-16 sm:scroll-mt-28 sm:py-24 dark:bg-hero-bg-muted"
  >
    <div class="mx-auto w-full max-w-[86rem] px-4 sm:px-8">
      <div
        class="grid gap-9 rounded-panel border-2 border-gray-100 bg-hero-bg p-6 text-gray-950 sm:gap-10 sm:p-9 lg:p-12 xl:p-14 dark:border-white/10 dark:bg-white/5 dark:text-hero-white dark:shadow-none"
      >
        <div class="flex min-w-0 flex-col">
          <h2 class="text-4xl leading-tight font-bold sm:text-5xl lg:max-w-[8.5em]">
            {{ t("pages.home.solution.headline") }}
          </h2>

          <p class="mt-5 max-w-xl text-lg leading-relaxed text-gray-950/65 dark:text-hero-white/70">
            {{ t("pages.home.solution.intro") }}
          </p>
        </div>

        <div class="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <article
            v-for="(principle, index) in principles"
            :key="principle.title"
            class="rounded-card border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <span
              class="mb-6 flex size-11 items-center justify-center rounded-full"
              :class="tileStyle(index).iconBg"
              aria-hidden="true"
            >
              <Icon
                :name="tileStyle(index).icon"
                :class="tileStyle(index).iconColor"
                style="width: 1.625rem; height: 1.625rem"
              />
            </span>

            <div class="min-w-0">
              <h3 class="text-xl leading-tight font-bold text-gray-950 dark:text-hero-white">
                {{ principle.title }}
              </h3>

              <p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-hero-white/70">
                {{ principle.description }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
