<script setup lang="ts">
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";

const { t } = useI18n();
const localizedPath = useLocalizedPath();
</script>

<template>
  <section id="kontakt" class="scroll-mt-24 bg-hero-blue-dark py-16 sm:py-24">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-8">
      <div
        class="relative overflow-hidden rounded-panel border-2 border-gray-100 bg-white px-6 py-16 text-center sm:px-16 sm:py-20 dark:bg-white/5"
      >
        <div class="relative z-10 mx-auto max-w-3xl">
          <h2
            class="text-4xl leading-tight font-bold text-gray-950 sm:text-5xl dark:text-hero-white"
          >
            {{ t("pages.home.cta.headline") }}
          </h2>
          <p class="mt-6 text-lg leading-relaxed text-gray-950/70 dark:text-hero-white/70">
            {{ t("pages.home.cta.subline") }}
          </p>

          <NuxtLink
            :to="localizedPath('contact')"
            class="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-hero-yellow px-6 py-4 text-center text-base font-bold text-gray-900 transition-[transform,filter] duration-200 ease-out hover:-translate-y-0.5 hover:brightness-95 sm:w-auto sm:px-8"
          >
            {{ t("pages.home.cta.primary") }}
            <Icon name="lucide:arrow-right" class="size-5" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
