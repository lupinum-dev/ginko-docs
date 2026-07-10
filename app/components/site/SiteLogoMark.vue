<script setup lang="ts">
import { useSiteNavigation } from "@/composables/useSiteNavigation";

const { site } = useSiteNavigation();
</script>

<template>
  <span class="relative inline-flex h-7 shrink-0" aria-hidden="true">
    <img :src="site.logo.light" alt="" class="height-7 dark:hidden" loading="eager" />
    <img :src="site.logo.dark" alt="" class="hidden height-7 dark:block" loading="eager" />
  </span>
</template>
