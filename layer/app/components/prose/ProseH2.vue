<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  id?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h2
    :id="id"
    :class="
      cn('flex scroll-mt-[var(--content-scroll-margin)] flex-row items-center gap-1.5', props.class)
    "
  >
    <a v-if="id" :href="`#${id}`" class="peer" data-card="">
      <slot />
    </a>
    <Icon
      v-if="id"
      name="lucide:link"
      class="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100"
      aria-hidden="true"
    />
    <slot v-else />
  </h2>
</template>
