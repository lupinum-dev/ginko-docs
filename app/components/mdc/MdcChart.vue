<script setup lang="ts">
import { computed } from "vue";
import { getAgentChartDemo } from "@/config/agent-chart-demo";

const chart = getAgentChartDemo();
const maxValue = computed(() => Math.max(...chart.values.map((item) => item.value), 1));
</script>

<template>
  <figure class="not-prose my-6 rounded-lg border border-border bg-card p-4">
    <figcaption class="space-y-1">
      <p class="text-sm font-medium text-foreground">{{ chart.title }}</p>
      <p class="text-sm text-muted-foreground">{{ chart.description }}</p>
    </figcaption>
    <dl class="mt-4 space-y-3">
      <div v-for="item in chart.values" :key="item.label" class="grid gap-1">
        <div class="flex items-center justify-between gap-3 text-sm">
          <dt class="font-medium text-foreground">{{ item.label }}</dt>
          <dd class="text-muted-foreground">{{ item.value }} {{ chart.unit }}</dd>
        </div>
        <div class="h-2 rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary"
            :style="{ width: `${Math.round((item.value / maxValue) * 100)}%` }"
          />
        </div>
      </div>
    </dl>
  </figure>
</template>
