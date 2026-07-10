<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { useI18n } from "#imports";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    class?: HTMLAttributes["class"];
    bodyClass?: HTMLAttributes["class"];
  }>(),
  {
    title: undefined,
    description: undefined,
  },
);
const { t } = useI18n();
</script>

<template>
  <div
    :class="
      cn('overflow-hidden rounded-xl border border-border bg-background shadow-lg', props.class)
    "
  >
    <div class="border-b border-border/70 bg-muted/40 px-6 py-5">
      <div
        class="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-background shadow-xs"
      >
        <Icon name="lucide:cookie" class="size-5 text-foreground" aria-hidden="true" />
      </div>
      <div class="space-y-2">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">
          {{ title ?? t("cookie.title") }}
        </h2>
        <p class="max-w-prose text-sm leading-6 text-muted-foreground">
          {{ description ?? t("cookie.description") }}
        </p>
      </div>
      <slot name="header" />
    </div>

    <div :class="cn('px-6 py-5', props.bodyClass)">
      <slot />
    </div>
  </div>
</template>
