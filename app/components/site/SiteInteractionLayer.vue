<script setup lang="ts">
import SiteCommandCenter from "@/features/search/components/SiteCommandCenter.vue";
import SiteSearchPageHighlight from "@/features/search/components/SiteSearchPageHighlight.vue";
import ChatLauncher from "@/features/chat/components/ChatLauncher.vue";
</script>

<template>
  <ClientOnly>
    <SiteCommandCenter />
    <SiteSearchPageHighlight />
    <ChatLauncher />
  </ClientOnly>
</template>
