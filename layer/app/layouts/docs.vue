<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/15">
    <SiteSkipLink />
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
