<script setup lang="ts">
defineProps<{
  quote: string;
  name: string;
  role: string;
  company: string;
}>();
</script>

<template>
  <figure class="site-card flex h-full flex-col">
    <blockquote class="flex-1 text-sm leading-6 text-muted-foreground">"{{ quote }}"</blockquote>

    <figcaption class="mt-6 border-t border-border pt-4">
      <p class="text-sm font-semibold text-foreground">{{ name }}</p>
      <p class="mt-1 text-xs text-muted-foreground">{{ role }}, {{ company }}</p>
    </figcaption>
  </figure>
</template>
