<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { ref } from "vue";
import { cn } from "#ginko-docs/lib/utils";
import { h } from "vue";

const model = defineModel<string>();
const textarea = ref<HTMLTextAreaElement | null>(null);

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

defineExpose({
  focus: () => textarea.value?.focus(),
});
</script>

<template>
  <textarea
    ref="textarea"
    v-model="model"
    data-slot="textarea"
    :class="
      cn(
        'min-h-36 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        props.class,
      )
    "
  />
</template>
