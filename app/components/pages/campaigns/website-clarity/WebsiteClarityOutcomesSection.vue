<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";

const { t } = useI18n();
const icons = ["lucide:scan-search", "lucide:route", "lucide:handshake"];
const outcomes = computed(() =>
  icons.map((icon, index) => ({
    icon,
    title: t(`pages.campaign.outcomes.items.${index}.title`),
    description: t(`pages.campaign.outcomes.items.${index}.description`),
  })),
);
</script>

<template>
  <section id="outcomes" class="scroll-mt-16 bg-muted/35 py-20 md:py-28">
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <p class="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
        {{ t("pages.campaign.outcomes.eyebrow") }}
      </p>
      <h2 class="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
        {{ t("pages.campaign.outcomes.headline") }}
      </h2>
      <div class="mt-12 grid border-y border-border md:grid-cols-3">
        <article
          v-for="(outcome, index) in outcomes"
          :key="outcome.title"
          class="py-8 md:px-7 md:first:pl-0 md:last:pr-0"
          :class="index > 0 ? 'border-t border-border md:border-t-0 md:border-l' : ''"
        >
          <Icon :name="outcome.icon" class="size-6 text-primary" aria-hidden="true" />
          <h3 class="mt-6 text-xl font-semibold">{{ outcome.title }}</h3>
          <p class="mt-3 text-sm leading-7 text-muted-foreground">{{ outcome.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
