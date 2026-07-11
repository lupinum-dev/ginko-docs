<script setup lang="ts">
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";

const { site } = useSiteNavigation();
</script>

<template>
  <span class="relative inline-flex h-7 shrink-0" aria-hidden="true">
    <img :src="site.logo.light" alt="" class="h-7 w-auto dark:hidden" loading="eager" />
    <img :src="site.logo.dark" alt="" class="hidden h-7 w-auto dark:block" loading="eager" />
  </span>
</template>
