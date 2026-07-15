<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/15">
    <SiteSkipLink />
    <SiteBanner />
    <SiteHeader />
    <main
      id="main-content"
      class="mx-auto w-full max-w-screen-2xl flex-1 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-16"
    >
      <slot />
    </main>
    <SiteFooter />
    <SiteInteractionLayer />
  </div>
</template>
