<script setup lang="ts">
defineProps<{
  headline: string;
  items: string[];
}>();
</script>

<template>
  <section class="border-b border-border bg-muted/20 py-10">
    <div class="site-container">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <p class="text-sm font-medium text-muted-foreground">{{ headline }}</p>
        <ul class="grid gap-3 text-sm font-medium text-foreground sm:grid-cols-2 lg:flex lg:gap-8">
          <li v-for="item in items" :key="item" class="flex items-center gap-2">
            <Icon name="lucide:check-circle-2" class="size-4 text-primary" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
