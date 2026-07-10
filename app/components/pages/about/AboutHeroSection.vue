<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";
import { siteConfig } from "@/site.config";

const { t } = useI18n();
const businessFacts = computed(() => [
  siteConfig.identity.brandName,
  siteConfig.identity.countryProfile,
  siteConfig.schema.areaServed.join(", "),
]);
</script>

<template>
  <section class="site-section-hero border-b border-border">
    <div class="site-container">
      <div class="max-w-3xl">
        <p class="mb-4 text-sm font-medium tracking-wider text-primary uppercase">
          {{ t("pages.about.eyebrow") }}
        </p>
        <h1
          class="text-4xl leading-[1.1] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]"
        >
          {{ t("pages.about.headline") }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {{ t("pages.about.subline") }}
        </p>
        <dl class="mt-8 grid gap-4 text-sm sm:grid-cols-3">
          <div v-for="fact in businessFacts" :key="fact" class="border-l border-border pl-4">
            <dt class="sr-only">{{ t("pages.about.businessFact") }}</dt>
            <dd class="font-medium text-foreground">{{ fact }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
