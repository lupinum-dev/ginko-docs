<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    correct?: boolean;
    selected?: boolean;
    disabled?: boolean;
    showResult?: boolean;
    optionIndex?: number;
    label?: string;
  }>(),
  {
    correct: false,
    selected: false,
    disabled: false,
    showResult: false,
    optionIndex: 0,
  },
);

const emit = defineEmits<{
  select: [];
}>();

const letter = computed(() => String.fromCharCode(65 + props.optionIndex));

const stateClass = computed(() => {
  if (props.showResult && props.correct) {
    return "border-success bg-success/10 text-foreground";
  }
  if (props.showResult && props.selected && !props.correct) {
    return "border-destructive bg-destructive/10 text-foreground";
  }
  if (props.selected) {
    return "border-primary bg-primary/5 ring-2 ring-primary/20";
  }
  return "";
});

const iconName = computed(() => {
  if (!props.showResult) return null;
  if (props.correct) return "lucide:circle-check";
  if (props.selected) return "lucide:circle-x";
  return null;
});
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="
      cn(
        'flex w-full items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left text-sm transition-all',
        !disabled && !showResult && 'cursor-pointer hover:bg-accent/50',
        disabled && 'cursor-default',
        stateClass,
      )
    "
    @click="!disabled && emit('select')"
  >
    <span
      :class="
        cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
          selected && !showResult && 'bg-primary text-primary-foreground',
          showResult && correct && 'bg-success text-success-foreground',
          showResult && selected && !correct && 'bg-destructive text-destructive-foreground',
          !selected && !showResult && 'bg-muted text-muted-foreground',
          showResult && !correct && !selected && 'bg-muted text-muted-foreground',
        )
      "
    >
      {{ letter }}
    </span>
    <span class="min-w-0 flex-1">
      <template v-if="label">{{ label }}</template>
      <slot v-else />
    </span>
    <Icon
      v-if="iconName"
      :name="iconName"
      :class="
        cn('size-4 shrink-0', correct && 'text-success', selected && !correct && 'text-destructive')
      "
      aria-hidden="true"
    />
  </button>
</template>
