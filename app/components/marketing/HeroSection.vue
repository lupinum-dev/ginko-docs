<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useTracking } from "@/composables/useTracking";

defineProps<{
  badge?: string;
  headline: string;
  subline: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}>();

const { trackCta } = useTracking();
</script>

<template>
  <section class="site-section-hero border-b border-border bg-background">
    <div class="site-container">
      <div class="max-w-4xl">
        <p v-if="badge" class="mb-5 text-sm font-medium tracking-wider text-primary uppercase">
          {{ badge }}
        </p>

        <h1 class="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          {{ headline }}
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          {{ subline }}
        </p>

        <div v-if="primaryCta || secondaryCta" class="mt-10 flex flex-wrap items-center gap-3">
          <Button v-if="primaryCta" as-child size="lg">
            <NuxtLink
              :to="primaryCta.href"
              @click="trackCta('business_hero', primaryCta.label, primaryCta.href, 'primary')"
            >
              {{ primaryCta.label }}
            </NuxtLink>
          </Button>
          <Button v-if="secondaryCta" as-child variant="outline" size="lg">
            <NuxtLink
              :to="secondaryCta.href"
              @click="trackCta('business_hero', secondaryCta.label, secondaryCta.href, 'secondary')"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
