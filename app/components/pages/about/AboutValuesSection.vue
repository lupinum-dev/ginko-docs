<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";

const { t } = useI18n();
const valueIcons = ["lucide:target", "lucide:trash-2", "lucide:zap", "lucide:shield-check"];
const values = computed(() =>
  valueIcons.map((icon, index) => ({
    icon,
    title: t(`pages.about.values.${index}.title`),
    description: t(`pages.about.values.${index}.description`),
  })),
);
</script>

<template>
  <section class="site-section border-b border-border bg-muted/40">
    <div class="site-container">
      <div class="mb-12 max-w-2xl sm:mb-14">
        <p class="mb-3 text-sm font-medium tracking-wider text-primary uppercase">
          {{ t("pages.about.valuesEyebrow") }}
        </p>
        <h2 class="text-3xl font-semibold tracking-tight text-foreground">
          {{ t("pages.about.valuesHeadline") }}
        </h2>
        <p class="mt-4 text-base leading-relaxed text-muted-foreground">
          {{ t("pages.about.valuesSubline") }}
        </p>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <article
          v-for="value in values"
          :key="value.title"
          class="site-card site-card-interactive group flex flex-col rounded-xl shadow-xs"
        >
          <div
            class="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <Icon :name="value.icon" class="size-5 [&_svg]:stroke-[1.75]" aria-hidden="true" />
          </div>
          <h3 class="font-semibold text-foreground">{{ value.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            {{ value.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
