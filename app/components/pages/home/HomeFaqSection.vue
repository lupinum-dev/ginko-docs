<script setup lang="ts">
import { useI18n } from "#imports";
import { useHomeMessageList } from "./home-content";

const { t } = useI18n();

const faqs = useHomeMessageList("faq.items");
</script>

<template>
  <section id="faq" class="scroll-mt-24 bg-white py-16 sm:py-24 dark:bg-hero-bg-muted">
    <div class="mx-auto w-full max-w-3xl px-4 sm:px-8">
      <div class="mb-10 text-center">
        <h2 class="text-4xl leading-tight font-bold text-gray-950 sm:text-5xl dark:text-hero-white">
          {{ t("pages.home.faq.headline") }}
        </h2>
      </div>

      <div
        class="divide-y divide-gray-100 rounded-section border border-gray-100 bg-white px-5 shadow-sm sm:px-7 dark:divide-white/10 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
      >
        <details v-for="item in faqs" :key="item.label" class="group">
          <summary
            class="flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-lg font-bold text-gray-950 transition-colors hover:text-gray-700 dark:text-hero-white dark:hover:text-hero-white/80 [&::-webkit-details-marker]:hidden"
          >
            <span>{{ item.label }}</span>
            <Icon
              name="lucide:chevron-down"
              class="mt-1 size-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180 dark:text-hero-white/55"
              aria-hidden="true"
            />
          </summary>
          <p class="pb-5 leading-relaxed text-gray-600 dark:text-hero-white/70">
            {{ item.content }}
          </p>
        </details>
      </div>
    </div>
  </section>
</template>
