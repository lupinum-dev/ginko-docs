<script setup lang="ts">
import SiteCommandCenter from "#ginko-docs/features/search/components/SiteCommandCenter.vue";
import SiteSearchPageHighlight from "#ginko-docs/features/search/components/SiteSearchPageHighlight.vue";
</script>

<template>
  <ClientOnly>
    <SiteCommandCenter />
    <SiteSearchPageHighlight />
  </ClientOnly>
</template>
