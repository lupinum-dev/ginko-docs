<script setup lang="ts">
import { provide } from "vue";

const MDC_READ_MORE_GROUP = Symbol.for("mdc.readMoreGroup");

provide(MDC_READ_MORE_GROUP, true);
</script>

<template>
  <div
    data-slot="card"
    class="not-prose my-6 gap-0 overflow-hidden rounded-xl border bg-card py-0 text-card-foreground shadow-xs transition-colors hover:border-foreground/20"
  >
    <div class="flex flex-col divide-y divide-border">
      <slot />
    </div>
  </div>
</template>
