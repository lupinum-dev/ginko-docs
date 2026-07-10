<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  headline: string;
  headingLevel?: 1 | 2;
  subline?: string;
  align?: "left" | "center";
}>();
</script>

<template>
  <div :class="align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'">
    <p v-if="eyebrow" class="mb-3 text-sm font-semibold tracking-wider text-primary uppercase">
      {{ eyebrow }}
    </p>
    <component
      :is="headingLevel === 1 ? 'h1' : 'h2'"
      class="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
    >
      {{ headline }}
    </component>
    <p v-if="subline" class="mt-4 text-base leading-7 text-muted-foreground">
      {{ subline }}
    </p>
  </div>
</template>
