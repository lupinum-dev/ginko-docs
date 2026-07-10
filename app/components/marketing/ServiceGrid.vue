<script setup lang="ts">
import BusinessServiceCard from "@/components/marketing/ServiceCard.vue";

defineProps<{
  services?: Array<{
    path: string;
    title: string;
    description: string;
    icon?: string;
    outcome?: string;
  }>;
  ctaLabel: string;
}>();
</script>

<template>
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <BusinessServiceCard
      v-for="service in services ?? []"
      :key="service.path"
      :title="service.title"
      :description="service.description"
      :href="service.path"
      :icon="service.icon"
      :outcome="service.outcome"
      :cta-label="ctaLabel"
    />
  </div>
</template>
