<script setup lang="ts">
import DocsSidebar from "#ginko-docs/features/docs/components/DocsSidebar.vue";
import SiteBanner from "#ginko-docs/components/site/SiteBanner.vue";
import SiteHeader from "#ginko-docs/components/site/SiteHeader.vue";
import SiteFooter from "#ginko-docs/components/site/SiteFooter.vue";
import SiteInteractionLayer from "#ginko-docs/components/site/SiteInteractionLayer.vue";
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/15">
    <SiteBanner />
    <SiteHeader />

    <div class="mx-auto flex w-full max-w-screen-2xl min-w-0 flex-1">
      <div
        class="pointer-events-none sticky top-[var(--site-header-height)] z-20 hidden h-[calc(100dvh-var(--site-header-height))] w-[var(--docs-sidebar-width)] shrink-0 overflow-hidden *:pointer-events-auto md:block"
      >
        <DocsSidebar />
      </div>

      <slot />
    </div>

    <SiteFooter />
    <SiteInteractionLayer />
  </div>
</template>
