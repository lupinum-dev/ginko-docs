<script setup lang="ts">
import { useScrollLock, onKeyStroke } from "@vueuse/core";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n, useRoute } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useSiteNavigation } from "@/composables/useSiteNavigation";
import { useCommandCenterState } from "@/features/search/useCommandCenter";
import { useTracking } from "@/composables/useTracking";
import ModeToggle from "@/components/site/ModeToggle.vue";
import SiteLogoMark from "@/components/site/SiteLogoMark.vue";
import SiteLocaleSwitcher from "@/components/site/SiteLocaleSwitcher.vue";

const { mainNav } = useSiteNavigation();
const { openCommandCenter } = useCommandCenterState();
const { t } = useI18n();
const route = useRoute();
const isMobileMenuOpen = ref(false);
const headerElement = ref<HTMLElement | null>(null);
const mobileMenuTop = ref("var(--site-header-height)");
const localizedPath = useLocalizedPath();
const { trackNavigation } = useTracking();

const isActive = (href: string) => route.path === href || route.path.startsWith(href + "/");

function mobileNavIcon(href: string) {
  if (href.includes("leistungen") || href.includes("services")) return "lucide:briefcase-business";
  if (href.includes("referenzen") || href.includes("references")) return "lucide:users-round";
  if (href.includes("blog")) return "lucide:file-text";
  if (href.includes("kontakt") || href.includes("contact")) return "lucide:mail";
  return "lucide:circle";
}

const mobileNavItems = computed(() =>
  mainNav.value.map((item) => ({
    label: item.label,
    href: item.href,
    icon: mobileNavIcon(item.href),
    children: [] as { label: string; href: string }[],
  })),
);
const homePath = computed(() => localizedPath("home"));

// Scroll lock when menu is open
const scrollLock = useScrollLock(import.meta.client ? document.body : null);

watch(isMobileMenuOpen, (open) => {
  scrollLock.value = open;
  if (open) {
    void nextTick(updateMobileMenuTop);
  }
});

function updateMobileMenuTop() {
  if (!import.meta.client || !headerElement.value) return;
  mobileMenuTop.value = `${Math.max(0, headerElement.value.getBoundingClientRect().bottom)}px`;
}

function handleResize() {
  if (isMobileMenuOpen.value) {
    updateMobileMenuTop();
  }
}

onMounted(() => window.addEventListener("resize", handleResize));
onBeforeUnmount(() => window.removeEventListener("resize", handleResize));

function openSearch() {
  isMobileMenuOpen.value = false;
  openCommandCenter();
}

function trackHeaderNavigation(label: string, href: string) {
  trackNavigation("header", label, href);
}

function trackMobileNavigation(label: string, href: string) {
  trackNavigation("mobile_menu", label, href);
}

// Close on Escape
onKeyStroke("Escape", () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
});

// Close menu on navigation
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);
</script>

<template>
  <header
    ref="headerElement"
    class="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-border bg-background/90 backdrop-blur-md"
  >
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md"
    >
      {{ t("nav.skip") }}
    </a>

    <div class="mx-auto flex w-full max-w-5xl flex-1 items-center gap-4 px-4 md:px-6">
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
          @click="trackHeaderNavigation(item.label, item.href)"
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
          <Kbd class="h-5 bg-background text-[10px]">⌘K</Kbd>
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
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
          :aria-label="isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          :aria-expanded="isMobileMenuOpen"
          type="button"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <Icon
            :name="isMobileMenuOpen ? 'lucide:x' : 'lucide:menu'"
            class="size-5"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  </header>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="-translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-4 opacity-0"
  >
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-x-0 bottom-0 z-40 [scrollbar-width:none] overflow-y-auto bg-background/95 backdrop-blur-md md:hidden [&::-webkit-scrollbar]:hidden"
      :style="{ top: mobileMenuTop }"
    >
      <div class="px-5 pt-9 pb-12">
        <nav class="space-y-4" :aria-label="t('nav.mobile')">
          <p class="px-3 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {{ t("nav.navigationSection") }}
          </p>
          <div class="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
            <NuxtLink
              v-for="(group, index) in mobileNavItems"
              :key="group.href"
              :to="group.href"
              class="flex h-[4.25rem] items-center gap-4 px-5 text-base font-semibold transition-colors hover:bg-muted/50"
              :class="[
                isActive(group.href) ? 'text-primary' : 'text-foreground',
                index > 0 && 'border-t border-border',
              ]"
              @click="
                trackMobileNavigation(group.label, group.href);
                isMobileMenuOpen = false;
              "
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

        <div class="mt-9 space-y-4">
          <p class="px-3 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
            {{ t("nav.settingsHelp") }}
          </p>
          <div class="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
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
    </div>
  </Transition>
</template>
