<script setup lang="ts">
import { computed, h } from "vue";
import { definePageMeta, useI18n, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { Button } from "@/components/ui/button";

definePageMeta({ layout: "marketing" });

const { t } = useI18n();
const localizedPath = useLocalizedPath();

useSeoMeta({
  title: computed(() => t("pages.thankYou.title")),
  description: computed(() => t("pages.thankYou.description")),
  robots: "noindex,follow",
});
</script>

<template>
  <div
    class="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center md:px-6"
  >
    <div class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon name="lucide:check" class="size-6" aria-hidden="true" />
    </div>
    <h1 class="mt-6 text-4xl font-semibold tracking-tight text-foreground">
      {{ t("pages.thankYou.headline") }}
    </h1>
    <p class="mt-4 text-base leading-7 text-muted-foreground">
      {{ t("pages.thankYou.subline") }}
    </p>
    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <Button as="a" :href="localizedPath('home')">{{ t("pages.thankYou.home") }}</Button>
      <Button as="a" variant="outline" :href="localizedPath('blog')">
        {{ t("pages.thankYou.blog") }}
      </Button>
    </div>
  </div>
</template>
