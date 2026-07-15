<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground">
    <SiteSkipLink />
    <SiteBanner landing />
    <SiteHeader />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <SiteInteractionLayer />
  </div>
</template>
