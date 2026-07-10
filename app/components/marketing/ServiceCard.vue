<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  href: string;
  icon?: string;
  outcome?: string;
  ctaLabel: string;
  headingLevel?: 2 | 3;
}>();
</script>

<template>
  <NuxtLink :to="href" class="site-card site-card-interactive group flex h-full flex-col">
    <div
      class="mb-5 flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary"
    >
      <Icon :name="icon ?? 'lucide:briefcase-business'" class="size-5" aria-hidden="true" />
    </div>
    <component
      :is="headingLevel === 2 ? 'h2' : 'h3'"
      class="font-heading text-xl font-semibold tracking-tight text-foreground"
    >
      {{ title }}
    </component>
    <p class="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
      {{ description }}
    </p>
    <p v-if="outcome" class="mt-5 border-t border-border pt-4 text-sm font-medium text-foreground">
      {{ outcome }}
    </p>
    <div class="mt-5 flex items-center gap-1 text-sm font-medium text-primary">
      {{ ctaLabel }}
      <Icon
        name="lucide:arrow-right"
        class="size-4 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </div>
  </NuxtLink>
</template>
