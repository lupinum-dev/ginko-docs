<script setup lang="ts">
import { Button } from "#ginko-docs/components/ui/button";
import { Kbd } from "#ginko-docs/components/ui/kbd";
import { Separator } from "#ginko-docs/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "#ginko-docs/components/ui/sheet";
import { computed, ref, watch } from "vue";
import { useI18n, useRoute } from "#imports";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";
import { useCommandCenterState } from "#ginko-docs/features/search/useCommandCenter";
import { useMetaKey } from "#ginko-docs/composables/useMetaKey";
import ModeToggle from "#ginko-docs/components/site/ModeToggle.vue";

const { mainNav } = useSiteNavigation();
const { openCommandCenter } = useCommandCenterState();
const { t } = useI18n();
const route = useRoute();
const isMobileMenuOpen = ref(false);
const localizedPath = useLocalizedPath();

const isActive = (href: string) => route.path === href || route.path.startsWith(href + "/");

const mobileNavItems = computed(() =>
  mainNav.value.map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon ?? "lucide:circle",
  })),
);

const metaKey = useMetaKey();
const searchShortcut = computed(() => (metaKey.value === "⌘" ? "⌘K" : "Ctrl K"));
const homePath = computed(() => localizedPath("home"));

// Scroll lock, Escape handling, and focus trapping come from the Sheet
// (reka-ui Dialog); only route-driven closing is ours.
function openSearch() {
  isMobileMenuOpen.value = false;
  openCommandCenter();
}

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);
</script>

<template>
  <header
    class="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md"
  >
    <div class="mx-auto flex w-full max-w-screen-2xl flex-1 items-center gap-4 px-4 md:px-6">
      <NuxtLink
        :to="homePath"
        class="flex items-center gap-2 font-semibold text-foreground"
        :aria-label="t('nav.home')"
      >
        <SiteLogoMark />
      </NuxtLink>
      <nav class="ml-4 hidden items-center gap-1 md:flex" :aria-label="t('nav.main')">
        <NuxtLink
          v-for="item in mainNav"
          :key="item.href"
          :to="item.href"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            isActive(item.href)
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          "
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          class="hidden h-9 w-52 justify-start gap-2 px-3 text-muted-foreground md:flex"
          :aria-label="t('nav.search')"
          type="button"
          @click="openSearch"
        >
          <Icon name="lucide:search" class="size-4 shrink-0" aria-hidden="true" />
          <span class="flex-1 text-left">{{ t("nav.search") }}...</span>
          <Kbd class="h-5 bg-background text-[10px]">{{ searchShortcut }}</Kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
          :aria-label="t('nav.search')"
          type="button"
          @click="openSearch"
        >
          <Icon name="lucide:search" class="size-5" aria-hidden="true" />
        </Button>

        <Separator orientation="vertical" class="mx-0.5 hidden h-5 md:block" />

        <ClientOnly>
          <div class="hidden md:block">
            <ModeToggle />
          </div>

          <template #fallback>
            <span
              class="hidden size-9 shrink-0 rounded-md border border-border bg-background md:block"
              aria-hidden="true"
            />
          </template>
        </ClientOnly>

        <SiteLocaleSwitcher class="hidden md:flex" />
        <Sheet v-model:open="isMobileMenuOpen">
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="md:hidden"
              :aria-label="t('nav.openMenu')"
              type="button"
            >
              <Icon name="lucide:menu" class="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            class="inset-0 h-dvh gap-0 [scrollbar-width:none] overflow-y-auto border-b-0 bg-background/95 backdrop-blur-md md:hidden [&::-webkit-scrollbar]:hidden"
          >
            <SheetTitle class="sr-only">{{ t("nav.mobile") }}</SheetTitle>
            <SheetDescription class="sr-only">{{ t("nav.main") }}</SheetDescription>
            <div class="px-5 pt-14 pb-12">
              <nav v-if="mobileNavItems.length" class="space-y-4" :aria-label="t('nav.mobile')">
                <p class="px-3 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
                  {{ t("nav.navigationSection") }}
                </p>
                <div
                  class="overflow-hidden rounded-xl border border-border bg-background shadow-xs"
                >
                  <NuxtLink
                    v-for="(group, index) in mobileNavItems"
                    :key="group.href"
                    :to="group.href"
                    class="flex h-[4.25rem] items-center gap-4 px-5 text-base font-semibold transition-colors hover:bg-muted/50"
                    :class="[
                      isActive(group.href) ? 'text-primary' : 'text-foreground',
                      index > 0 && 'border-t border-border',
                    ]"
                    @click="isMobileMenuOpen = false"
                  >
                    <span
                      class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground"
                    >
                      <Icon :name="group.icon" class="size-5" aria-hidden="true" />
                    </span>
                    <span class="min-w-0 flex-1 truncate">{{ group.label }}</span>
                    <Icon
                      name="lucide:chevron-right"
                      class="size-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </NuxtLink>
                </div>
              </nav>

              <div class="space-y-4" :class="mobileNavItems.length ? 'mt-9' : ''">
                <p class="px-3 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
                  {{ t("nav.settingsHelp") }}
                </p>
                <div
                  class="overflow-hidden rounded-xl border border-border bg-background shadow-xs"
                >
                  <button
                    type="button"
                    class="flex h-[4.25rem] w-full items-center gap-4 px-5 text-start text-base font-semibold transition-colors hover:bg-muted/50"
                    @click="openSearch"
                  >
                    <span
                      class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground"
                    >
                      <Icon name="lucide:search" class="size-5" aria-hidden="true" />
                    </span>
                    <span class="min-w-0 flex-1 truncate">{{ t("nav.search") }}</span>
                    <Icon
                      name="lucide:chevron-right"
                      class="size-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                  <div class="grid grid-cols-2 border-t border-border">
                    <ModeToggle variant="menu-tile" class="border-r border-border" />
                    <SiteLocaleSwitcher
                      variant="menu-tile"
                      class="flex"
                      @navigate="isMobileMenuOpen = false"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
