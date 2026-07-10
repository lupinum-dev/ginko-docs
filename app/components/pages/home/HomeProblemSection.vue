<script setup lang="ts">
import { useI18n } from "#imports";
import { useHomeMessageList } from "./home-content";

const { t } = useI18n();

const items = useHomeMessageList("problem.items");

const tileStyles = [
  {
    iconBg: "bg-hero-blue-muted",
    iconColor: "text-hero-blue",
    icon: "material-symbols:web-asset-off-rounded",
  },
  {
    iconBg: "bg-hero-mint-muted",
    iconColor: "text-hero-mint-dark",
    icon: "material-symbols:record-voice-over-rounded",
  },
  {
    iconBg: "bg-hero-yellow-muted",
    iconColor: "text-hero-yellow-dark",
    icon: "material-symbols:category-rounded",
  },
  { iconBg: "bg-hero-coral-muted", iconColor: "text-hero-coral", icon: "maki:cross" },
  { iconBg: "bg-hero-blue-muted", iconColor: "text-hero-blue", icon: "si:shield-bad-fill" },
  {
    iconBg: "bg-hero-mint-muted",
    iconColor: "text-hero-mint-dark",
    icon: "material-symbols:database-off",
  },
] as const;

function tileStyle(index: number) {
  return tileStyles[index] ?? tileStyles[0];
}
</script>

<template>
  <section class="bg-hero-bg py-16 sm:py-24">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div class="lg:sticky lg:top-24 lg:self-start">
          <h2
            class="mt-4 text-4xl leading-tight font-bold text-gray-950 sm:text-5xl dark:text-hero-white"
          >
            {{ t("pages.home.problem.headline") }}
          </h2>

          <p class="mt-5 text-lg leading-relaxed text-gray-600 dark:text-hero-white/70">
            {{ t("pages.home.problem.intro") }}
          </p>
        </div>

        <div
          class="overflow-hidden rounded-panel border border-gray-100 bg-white shadow-sm shadow-gray-950/[0.03] dark:border-white/10 dark:bg-white/5 dark:shadow-none"
        >
          <article
            v-for="(item, index) in items"
            :key="item.title"
            class="group border-b border-gray-100 px-3.5 py-3.5 last:border-b-0 sm:p-5 lg:p-6 dark:border-white/10"
          >
            <div class="flex gap-3.5 sm:gap-5">
              <span
                class="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full"
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
                <h3
                  class="text-[16px] leading-snug font-bold text-gray-950 sm:text-xl dark:text-hero-white"
                >
                  {{ item.title }}
                </h3>
                <p
                  class="mt-1.5 text-[14px] leading-[1.55] text-gray-600 sm:mt-2 sm:text-[15px] sm:leading-relaxed dark:text-hero-white/70"
                >
                  {{ item.description }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
