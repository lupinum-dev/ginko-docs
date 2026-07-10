<script setup lang="ts">
import { toIconifyName } from "@/lib/ginko-icon";

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

defineProps<{
  eyebrow?: string;
  headline: string;
  subline?: string;
  features: Feature[];
}>();
</script>

<template>
  <section class="site-section-hero">
    <div class="site-container">
      <div class="mx-auto mb-16 max-w-2xl text-center">
        <p v-if="eyebrow" class="mb-2 text-sm font-semibold tracking-wider text-primary uppercase">
          {{ eyebrow }}
        </p>
        <h2 class="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {{ headline }}
        </h2>
        <p v-if="subline" class="mt-4 text-lg text-muted-foreground">
          {{ subline }}
        </p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="site-card site-card-interactive group rounded-xl"
        >
          <div
            class="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary"
          >
            <Icon
              :name="toIconifyName(feature.icon) ?? 'lucide:circle'"
              class="size-5 [&_svg]:stroke-[1.75]"
              aria-hidden="true"
            />
          </div>
          <h3 class="mb-2 font-heading font-semibold text-foreground">{{ feature.title }}</h3>
          <p class="text-sm leading-relaxed text-muted-foreground">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
