<script setup lang="ts">
import { provide } from "vue";

const MDC_FIELD_GROUP = Symbol.for("mdc.fieldGroup");

provide(MDC_FIELD_GROUP, true);
</script>

<template>
  <div
    data-slot="card"
    class="not-prose my-4 flex flex-col gap-0 overflow-hidden rounded-xl border bg-card py-0 text-card-foreground shadow-xs"
  >
    <div class="flex flex-col divide-y divide-border">
      <slot />
    </div>
  </div>
</template>
