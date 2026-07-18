<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "#ginko-docs/lib/utils";
import { useI18n } from "#imports";

const props = defineProps<{
  items: { title: string; path?: string }[];
  class?: HTMLAttributes["class"];
}>();

const { t } = useI18n();
</script>

<template>
  <nav
    v-if="items.length"
    :class="cn('flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground', props.class)"
    :aria-label="t('docs.breadcrumbs')"
  >
    <template v-for="(item, index) in items" :key="item.path ?? item.title">
      <Icon
        v-if="index > 0"
        name="lucide:chevron-right"
        class="size-3.5 text-border"
        aria-hidden="true"
      />
      <NuxtLink
        v-if="item.path"
        :to="item.path"
        class="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {{ item.title }}
      </NuxtLink>
      <span v-else>{{ item.title }}</span>
    </template>
  </nav>
</template>
