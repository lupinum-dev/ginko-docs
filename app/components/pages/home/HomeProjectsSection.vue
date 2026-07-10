<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useHomeMessageList } from "./home-content";

const { t } = useI18n();
const localizedPath = useLocalizedPath();

const references = useHomeMessageList("references.items");
const referencesPath = computed(() => localizedPath("references"));
</script>

<template>
  <section id="referenzen" class="scroll-mt-24 bg-hero-bg py-16 sm:py-24 dark:bg-hero-bg-muted">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div class="mb-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <h2
            class="mt-4 text-4xl pl-12 font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-hero-white"
          >
            {{ t("pages.home.references.headline") }}
          </h2>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-12">
        <article
          v-if="references[0]"
          class="relative flex flex-col overflow-hidden rounded-section bg-hero-blue-muted p-8 sm:p-12 lg:col-span-6"
        >
          <div class="relative z-10 w-full">
            <span
              class="inline-block rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-bold tracking-wide text-primary-foreground"
            >
              {{ references[0].name }}
            </span>
            <h3
              class="mb-4 mt-6 text-[30px] font-bold leading-tight tracking-tight text-gray-900 sm:text-[38px] dark:text-hero-white"
            >
              {{ references[0].title }}
            </h3>
          </div>

          <div class="mt-8">
            <div class="overflow-hidden rounded-lg">
              <NuxtImg
                src="/images/home/references/OfficeToGo.png"
                alt="OfficeToGo Website"
                class="w-full object-cover aspect-3/5"
                loading="lazy"
              />
            </div>
          </div>
        </article>

        <div class="flex flex-col gap-6 lg:col-span-6">
          <article
            v-if="references[1]"
            class="flex flex-1 flex-col overflow-hidden rounded-section border border-gray-100 bg-white p-8 shadow-sm sm:p-10 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
          >
            <div class="w-full">
              <span
                class="inline-block rounded-full bg-hero-coral-muted px-3 py-1 text-[12px] font-bold tracking-wide text-hero-coral-text"
              >
                {{ references[1].name }}
              </span>
              <h3
                class="mb-3 mt-4 text-[22px] font-bold tracking-tight text-gray-900 sm:text-[26px] dark:text-hero-white"
              >
                {{ references[1].title }}
              </h3>
            </div>

            <div class="mt-6 overflow-hidden rounded-lg">
              <NuxtImg
                src="/images/home/references/Gloesmann.png"
                alt="Glösmann Bau-Service Website"
                class="w-full object-cover aspect-video"
                loading="lazy"
              />
            </div>
          </article>

          <article
            v-if="references[2]"
            class="flex flex-1 flex-col overflow-hidden rounded-section border border-gray-100 bg-white p-8 shadow-sm sm:p-10 dark:border-white/10 dark:bg-white/5 dark:shadow-none"
          >
            <div class="w-full">
              <span
                class="inline-block rounded-full bg-hero-mint-muted px-3 py-1 text-[12px] font-bold tracking-wide text-hero-mint-text"
              >
                {{ references[2].name }}
              </span>
              <h3
                class="mb-3 mt-4 text-[22px] font-bold leading-tight tracking-tight text-gray-900 sm:text-[26px] dark:text-hero-white"
              >
                {{ references[2].title }}
              </h3>
            </div>

            <div class="mt-6 overflow-hidden rounded-lg">
              <NuxtImg
                src="/images/home/references/Prem_square.jpg"
                alt="Nepal Himalayas Adventure Website"
                class="w-full object-cover aspect-video"
                loading="lazy"
              />
            </div>
          </article>
        </div>
      </div>

      <div class="mt-12 flex justify-center">
        <NuxtLink
          :to="referencesPath"
          class="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-[14px] font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-300 dark:border-white/15 dark:bg-white/5 dark:text-hero-white dark:shadow-none dark:hover:border-white/25 dark:hover:bg-white/10"
        >
          Alle Referenzen ansehen
          <Icon
            name="lucide:arrow-right"
            class="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
