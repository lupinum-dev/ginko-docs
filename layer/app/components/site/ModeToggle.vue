<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import { useColorMode, useI18n } from "#imports";
import { cn } from "#ginko-docs/utils";
import { headerUtilityButtonClass } from "#ginko-docs/components/site/header-utils";
import {
  nextExplicitColorMode,
  themeToggleIcon,
  themeToggleLabelKey,
} from "#ginko-docs/components/site/mode-toggle.utils";

const props = withDefaults(
  defineProps<{
    variant?: "icon" | "menu-row";
    class?: HTMLAttributes["class"];
  }>(),
  {
    variant: "icon",
  },
);

const colorMode = useColorMode();
const { t } = useI18n();

const isDark = computed(() => colorMode.value === "dark");
const toggleIcon = computed(() => themeToggleIcon(isDark.value));
const toggleLabel = computed(() => t(themeToggleLabelKey(isDark.value)));

function toggleColorMode() {
  colorMode.preference = nextExplicitColorMode(isDark.value ? "dark" : "light");
}
</script>

<template>
  <button
    v-if="variant === 'menu-row'"
    type="button"
    role="switch"
    :aria-checked="isDark"
    :aria-label="toggleLabel"
    :class="
      cn(
        'flex h-14 w-full items-center justify-between rounded-none px-5 text-base font-semibold hover:bg-transparent',
        props.class,
      )
    "
    @click="toggleColorMode"
  >
    <span class="flex min-w-0 items-center gap-4">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground"
      >
        <Icon :name="toggleIcon" class="size-5" aria-hidden="true" />
      </span>
      <span class="truncate">{{ t("theme.label") }}</span>
    </span>
    <span
      class="relative inline-flex h-6 w-11 shrink-0 rounded-full border border-border bg-muted/60 transition-colors"
      :class="isDark ? 'bg-foreground/80' : ''"
      aria-hidden="true"
    >
      <span
        class="absolute top-0.5 size-5 rounded-full bg-background shadow-xs transition-transform motion-reduce:transition-none"
        :class="isDark ? 'translate-x-[1.375rem]' : 'translate-x-0.5'"
      />
    </span>
  </button>
  <button
    v-else
    type="button"
    role="switch"
    :aria-checked="isDark"
    :aria-label="toggleLabel"
    :class="cn(headerUtilityButtonClass, props.class)"
    @click="toggleColorMode"
  >
    <Icon :name="toggleIcon" class="size-[18px]" aria-hidden="true" />
  </button>
</template>
