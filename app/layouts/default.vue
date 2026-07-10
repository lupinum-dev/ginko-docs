<script setup lang="ts">
import SiteHeader from "@/components/site/SiteHeader.vue";
import SiteFooter from "@/components/site/SiteFooter.vue";
import SiteInteractionLayer from "@/components/site/SiteInteractionLayer.vue";
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground">
    <SiteHeader />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <SiteInteractionLayer />
  </div>
</template>
