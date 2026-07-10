<script setup lang="ts">
import { inject } from "vue";

const MDC_FIELD_GROUP = Symbol.for("mdc.fieldGroup");
const inFieldGroup = inject(MDC_FIELD_GROUP, false);

defineProps<{
  name: string;
  type?: string;
  required?: boolean;
  description?: string;
  defaultValue?: string;
}>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      inFieldGroup
        ? 'not-prose flex flex-col gap-0 rounded-none border-0 bg-transparent py-0 text-card-foreground shadow-none ring-0 outline-none'
        : 'not-prose my-4 flex flex-col gap-0 rounded-xl border bg-card py-0 text-card-foreground shadow-xs'
    "
  >
    <div data-slot="card-content" class="space-y-4 px-6 py-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="flex flex-wrap items-center gap-2">
          <code class="relative rounded-md bg-muted px-1 font-sans font-normal text-foreground">
            {{ name }}
          </code>

          <span
            v-if="required"
            class="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
          >
            Required
          </span>
        </div>

        <span v-if="type" class="font-mono text-sm text-muted-foreground sm:ml-auto">
          {{ type }}
        </span>
      </div>

      <div class="content-prose content-prose-trim text-muted-foreground">
        <slot v-if="$slots.default" unwrap="p" />
        <span v-else-if="description">{{ description }}</span>
      </div>
    </div>

    <div
      v-if="defaultValue"
      data-slot="card-footer"
      class="flex flex-wrap items-center gap-2 border-t border-border pb-6 text-sm"
    >
      <span class="font-medium text-foreground">Default:</span>
      <code class="relative rounded-md bg-muted px-1 font-sans font-normal text-muted-foreground">
        {{ defaultValue }}
      </code>
    </div>
  </div>
</template>
