<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useTracking } from "@/composables/useTracking";

defineProps<{
  headline: string;
  subline?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}>();

const { trackCta } = useTracking();

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}
</script>

<template>
  <section class="site-section bg-primary">
    <div class="site-container">
      <div class="mx-auto max-w-3xl text-center">
        <h2
          class="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl"
        >
          {{ headline }}
        </h2>
        <p
          v-if="subline"
          class="mx-auto mt-4 max-w-xl text-base leading-7 text-primary-foreground/80"
        >
          {{ subline }}
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button as-child variant="secondary" size="lg">
            <a
              v-if="isExternalHref(primaryCta.href)"
              :href="primaryCta.href"
              :target="primaryCta.href.startsWith('http') ? '_blank' : undefined"
              :rel="primaryCta.href.startsWith('http') ? 'noopener noreferrer' : undefined"
              @click="trackCta('business_cta', primaryCta.label, primaryCta.href, 'primary')"
            >
              {{ primaryCta.label }}
            </a>
            <NuxtLink
              v-else
              :to="primaryCta.href"
              @click="trackCta('business_cta', primaryCta.label, primaryCta.href, 'primary')"
            >
              {{ primaryCta.label }}
            </NuxtLink>
          </Button>
          <Button
            v-if="secondaryCta"
            as-child
            variant="ghost"
            size="lg"
            class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <a
              v-if="isExternalHref(secondaryCta.href)"
              :href="secondaryCta.href"
              :target="secondaryCta.href.startsWith('http') ? '_blank' : undefined"
              :rel="secondaryCta.href.startsWith('http') ? 'noopener noreferrer' : undefined"
              @click="trackCta('business_cta', secondaryCta.label, secondaryCta.href, 'secondary')"
            >
              {{ secondaryCta.label }}
            </a>
            <NuxtLink
              v-else
              :to="secondaryCta.href"
              @click="trackCta('business_cta', secondaryCta.label, secondaryCta.href, 'secondary')"
            >
              {{ secondaryCta.label }}
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
