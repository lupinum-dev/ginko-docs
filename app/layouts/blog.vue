<script setup lang="ts">
import SiteBanner from "@/components/site/SiteBanner.vue";
import SiteHeader from "@/components/site/SiteHeader.vue";
import SiteFooter from "@/components/site/SiteFooter.vue";
import SiteInteractionLayer from "@/components/site/SiteInteractionLayer.vue";
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/15">
    <SiteBanner />
    <SiteHeader />
    <main
      id="main-content"
      class="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-12 md:px-6 md:py-16"
    >
      <slot />
    </main>
    <SiteFooter />
    <SiteInteractionLayer />
  </div>
</template>
