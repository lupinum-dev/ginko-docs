<script setup lang="ts">
import SiteCommandCenter from "@/features/search/components/SiteCommandCenter.vue";
import SiteSearchPageHighlight from "@/features/search/components/SiteSearchPageHighlight.vue";
</script>

<template>
  <ClientOnly>
    <SiteCommandCenter />
    <SiteSearchPageHighlight />
  </ClientOnly>
</template>
