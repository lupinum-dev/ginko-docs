<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "../../utils";

const props = defineProps<{
  id?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h3 :id="id" :class="cn('flex scroll-mt-28 flex-row items-center gap-1.5', props.class)">
    <a v-if="id" :href="`#${id}`" class="peer" data-card="">
      <slot />
    </a>
    <Icon
      v-if="id"
      name="lucide:link"
      class="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100"
      aria-hidden="true"
    />
    <slot v-else />
  </h3>
</template>
