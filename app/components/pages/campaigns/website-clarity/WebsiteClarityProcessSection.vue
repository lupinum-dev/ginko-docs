<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";

const { t } = useI18n();
const steps = computed(() =>
  [0, 1, 2].map((index) => ({
    number: String(index + 1).padStart(2, "0"),
    title: t(`pages.campaign.process.items.${index}.title`),
    description: t(`pages.campaign.process.items.${index}.description`),
  })),
);
</script>

<template>
  <section class="py-20 md:py-28">
    <div class="mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p class="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
          {{ t("pages.campaign.process.eyebrow") }}
        </p>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          {{ t("pages.campaign.process.headline") }}
        </h2>
      </div>
      <ol class="border-t border-border">
        <li
          v-for="step in steps"
          :key="step.number"
          class="grid grid-cols-[3rem_1fr] gap-4 border-b border-border py-7"
        >
          <span class="font-mono text-sm text-primary">{{ step.number }}</span>
          <div>
            <h3 class="text-lg font-semibold">{{ step.title }}</h3>
            <p class="mt-2 text-sm leading-7 text-muted-foreground">{{ step.description }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
