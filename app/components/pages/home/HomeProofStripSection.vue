<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useHomeMessageList, type HomeProofItem } from "./home-content";

const { t } = useI18n();
const localizedPath = useLocalizedPath();

const referencesPath = computed(() => localizedPath("references"));
const proofItems = useHomeMessageList("proof.items");

function logoSizeClass(item: HomeProofItem) {
  return item.logo.includes("Bau Service")
    ? "max-h-[52px] max-w-32 lg:max-h-16 lg:max-w-44"
    : "max-h-10 max-w-36 lg:max-h-12 lg:max-w-44";
}
</script>

<template>
  <section
    class="border-y border-gray-100 bg-white py-5 sm:py-6 dark:border-white/10 dark:bg-hero-bg-muted"
  >
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <div
        class="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,0.26fr)_minmax(0,1fr)] lg:items-center"
      >
        <div class="flex items-center justify-between gap-4 lg:block">
          <p class="text-[13px] font-semibold text-gray-900 dark:text-hero-white">
            {{ t("pages.home.proof.eyebrow") }}
          </p>
          <NuxtLink
            :to="referencesPath"
            class="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 transition-colors hover:text-gray-900 dark:text-hero-white/60 dark:hover:text-hero-white"
          >
            {{ t("pages.home.proof.cta") }}
            <Icon
              name="lucide:arrow-right"
              class="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>

        <ul
          class="grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-gray-100 dark:lg:divide-white/10"
        >
          <li
            v-for="item in proofItems"
            :key="item.name"
            class="flex min-h-[78px] flex-col items-center justify-center gap-2 py-1 text-center lg:min-h-[88px] lg:items-start lg:px-6 lg:text-left lg:first:pl-0 lg:last:pr-0"
          >
            <div class="flex h-11 w-full items-center justify-center lg:h-[52px] lg:justify-start">
              <img
                :src="item.logo"
                :alt="item.name"
                class="object-contain opacity-85 transition duration-200 hover:opacity-100 dark:brightness-95"
                :class="logoSizeClass(item)"
              />
            </div>
            <p class="text-[12px] leading-none text-gray-600 dark:text-hero-white/75">
              {{ item.category }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
