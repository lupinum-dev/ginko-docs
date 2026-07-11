<script setup lang="ts">
import { useI18n } from "#imports";

defineProps<{
  prev?: { path?: string; title?: string } | null;
  next?: { path?: string; title?: string } | null;
}>();
const { t } = useI18n();
</script>

<template>
  <nav
    v-if="prev || next"
    class="mt-12 grid grid-cols-2 gap-3 border-t border-border pt-8"
    :aria-label="t('docs.pageNavigation')"
  >
    <!-- Previous -->
    <NuxtLink
      v-if="prev"
      :to="prev.path"
      class="group col-start-1 flex flex-col gap-1.5 rounded-xl border border-border bg-card px-5 py-4 transition-all duration-150 hover:border-foreground/20 hover:bg-accent/50 hover:shadow-sm"
    >
      <span
        class="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground"
      >
        <Icon
          name="lucide:chevron-left"
          class="size-3.5 transition-transform group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        {{ t("docs.previous") }}
      </span>
      <span class="text-sm leading-snug font-semibold text-foreground">{{ prev.title }}</span>
    </NuxtLink>
    <div v-else />

    <!-- Next -->
    <NuxtLink
      v-if="next"
      :to="next.path"
      class="group col-start-2 flex flex-col items-end gap-1.5 rounded-xl border border-border bg-card px-5 py-4 text-right transition-all duration-150 hover:border-foreground/20 hover:bg-accent/50 hover:shadow-sm"
    >
      <span
        class="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground"
      >
        {{ t("docs.next") }}
        <Icon
          name="lucide:chevron-right"
          class="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
      <span class="text-sm leading-snug font-semibold text-foreground">{{ next.title }}</span>
    </NuxtLink>
    <div v-else />
  </nav>
</template>
