<script setup lang="ts">
import { computed } from "vue";
import { useI18n, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useSiteNavigation } from "@/composables/useSiteNavigation";

const { t } = useI18n();
const { site } = useSiteNavigation();
const localizedPath = useLocalizedPath();

useSeoMeta({
  title: computed(() => site.value.name),
  description: computed(() => site.value.description),
});
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-24 md:px-6">
    <h1 class="text-3xl font-semibold tracking-tight text-foreground">{{ site.name }}</h1>
    <p class="text-lg text-muted-foreground">{{ site.description }}</p>
    <p class="text-sm text-muted-foreground">
      <NuxtLink :to="localizedPath('docs')" class="underline underline-offset-4">
        {{ t("nav.documentation") }}
      </NuxtLink>
    </p>
  </div>
</template>
