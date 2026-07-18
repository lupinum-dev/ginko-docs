<script setup lang="ts">
import { computed } from "vue";
import type { HTMLAttributes } from "vue";
import { useMetaKey } from "../../composables/useMetaKey";
import { cn } from "../../utils";

interface Props {
  value?: string;
  size?: "sm" | "md";
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

const metaSymbol = useMetaKey();

const resolvedValue = computed(() => {
  if (props.value === "meta") return metaSymbol.value;
  return props.value;
});
</script>

<template>
  <kbd
    :class="
      cn(
        'pointer-events-none inline-flex w-fit items-center justify-center gap-1 rounded-sm bg-muted font-sans font-medium text-muted-foreground ring-1 ring-border select-none [&_svg:not([class*=size-])]:size-3',
        size === 'md' ? 'h-7 min-w-7 px-1.5 text-sm' : 'h-5 min-w-5 px-1 text-xs',
        props.class,
      )
    "
  >
    <!-- Provide a slot so users can inject custom icons instead of strings if needed -->
    <slot>
      {{ resolvedValue }}
    </slot>
  </kbd>
</template>
