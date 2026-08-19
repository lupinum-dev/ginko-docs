<script setup lang="ts">
import { Button } from "#ginko-docs/components/ui/button";
import { Kbd } from "#ginko-docs/components/ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "#ginko-docs/components/ui/sheet";
import { computed, nextTick, ref, watch } from "vue";
import {
  findFirstNavigationPage,
  navigationItemContainsPath,
  normalizeNavigationPath,
} from "@lupinum/ginko-content/navigation";
import { useI18n, useRoute } from "#imports";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";
import { useCommandCenterState } from "#ginko-docs/features/search/useCommandCenter";
import { useMetaKey } from "#ginko-docs/composables/useMetaKey";
import { useDocsNavigationData } from "#ginko-docs/features/docs/composables/useDocsNavigationData";
import {
  getDocsNavigationSections,
  normalizeDocsNavigationItem,
} from "#ginko-docs/features/docs/docs-navigation";
import ModeToggle from "#ginko-docs/components/site/ModeToggle.vue";
import { useGinkoDocsConfig } from "#ginko-docs/composables/useGinkoDocsConfig";

const { mainNav } = useSiteNavigation();
const { openCommandCenter } = useCommandCenterState();
const config = useGinkoDocsConfig();
const { t } = useI18n();
const route = useRoute();
const isMobileMenuOpen = ref(false);
const localizedPath = useLocalizedPath();

const isActive = (href: string) => route.path === href || route.path.startsWith(href + "/");

const metaKey = useMetaKey();
const searchShortcut = computed(() => (metaKey.value === "⌘" ? "⌘K" : "Ctrl K"));
const homePath = computed(() => localizedPath("home"));
const docsPath = computed(() => localizedPath("docs"));

const { data: docsNavData } = useDocsNavigationData();
const docsSections = computed(() =>
  getDocsNavigationSections(
    (docsNavData.value ?? []).map((item, index) => normalizeDocsNavigationItem(item, index)),
  ),
);
const docsMenuSections = computed(() => {
  const currentPath = normalizeNavigationPath(route.path);

  return docsSections.value
    .map((section) => ({
      id: section.id,
      title: section.title,
      links: section.items
        .map((item) => ({
          id: item.id,
          label: item.title,
          href: item.path ?? findFirstNavigationPage(item.children)?.path,
          active: navigationItemContainsPath(item, currentPath),
        }))
        .filter((link): link is typeof link & { href: string } => Boolean(link.href)),
    }))
    .filter((section) => section.links.length > 0);
});
const hasDocsLevel = computed(() => docsMenuSections.value.length > 0);

const rootNavItems = computed(() =>
  mainNav.value.map((item) => ({
    ...item,
    drill: hasDocsLevel.value && item.href === docsPath.value,
  })),
);
const docsLevelTitle = computed(
  () => rootNavItems.value.find((item) => item.drill)?.label ?? t("nav.documentation"),
);

type MenuLevel = "root" | "docs";
const menuLevel = ref<MenuLevel>("root");
const docsDrillButton = ref<HTMLButtonElement | null>(null);
const docsBackButton = ref<HTMLButtonElement | null>(null);

function setDrillButtonRef(el: unknown) {
  docsDrillButton.value = el instanceof HTMLButtonElement ? el : null;
}

async function drillIntoDocs() {
  menuLevel.value = "docs";
  await nextTick();
  docsBackButton.value?.focus({ preventScroll: true });
}

async function backToRoot() {
  menuLevel.value = "root";
  await nextTick();
  docsDrillButton.value?.focus({ preventScroll: true });
}

function closeMenu() {
  isMobileMenuOpen.value = false;
}

function openSearch() {
  isMobileMenuOpen.value = false;
  openCommandCenter();
}

watch(isMobileMenuOpen, (open) => {
  if (open) {
    menuLevel.value = hasDocsLevel.value && isActive(docsPath.value) ? "docs" : "root";
  }
});

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
    <div
      class="mx-auto flex w-full max-w-screen-2xl min-w-0 flex-1 items-center gap-3 px-4 min-[691px]:gap-4 md:px-6"
    >
      <NuxtLink
        :to="homePath"
        class="flex shrink-0 items-center gap-2 font-semibold text-foreground"
        :aria-label="t('nav.home')"
      >
        <SiteLogoMark />
      </NuxtLink>

      <nav
        class="ml-1 hidden shrink-0 items-center gap-1 min-[691px]:ml-2 min-[691px]:flex"
        :aria-label="t('nav.main')"
      >
        <NuxtLink
          v-for="item in mainNav"
          :key="item.href"
          :to="item.href"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            isActive(item.href)
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          "
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex min-w-0 flex-1 items-center gap-1 min-[691px]:gap-1.5">
        <Button
          variant="outline"
          class="hidden h-9 min-w-40 max-w-[22.5rem] flex-1 justify-start gap-2 rounded-lg border-border/70 bg-muted/35 px-3 text-muted-foreground min-[691px]:flex"
          :aria-label="t('nav.search')"
          type="button"
          @click="openSearch"
        >
          <Icon name="lucide:search" class="size-4 shrink-0" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate text-left">{{ t("nav.searchDocumentation") }}</span>
          <Kbd class="h-5 shrink-0 bg-background text-[10px]">{{ searchShortcut }}</Kbd>
        </Button>

        <div class="ml-auto flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            class="size-9 rounded-lg min-[691px]:hidden"
            :aria-label="t('nav.search')"
            type="button"
            @click="openSearch"
          >
            <Icon name="lucide:search" class="size-[18px]" aria-hidden="true" />
          </Button>

          <ClientOnly>
            <ModeToggle class="hidden min-[691px]:inline-flex" />

            <template #fallback>
              <span
                class="hidden size-9 shrink-0 rounded-lg min-[691px]:inline-flex"
                aria-hidden="true"
              />
            </template>
          </ClientOnly>

          <SiteLocaleSwitcher class="hidden min-[691px]:flex" />

          <SiteSocialLinks v-if="config.nav.socialIcons" />

          <Sheet v-model:open="isMobileMenuOpen">
            <SheetTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="size-9 rounded-lg min-[691px]:hidden"
                :aria-label="t('nav.openMenu')"
                type="button"
              >
                <Icon name="lucide:menu" class="size-[18px]" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              class="inset-0 h-dvh gap-0 overflow-hidden border-b-0 bg-background/95 p-0 backdrop-blur-md min-[691px]:hidden"
            >
              <SheetTitle class="sr-only">{{ t("nav.mobile") }}</SheetTitle>
              <SheetDescription class="sr-only">{{ t("nav.main") }}</SheetDescription>
              <div class="flex h-full min-h-0 flex-col pt-16">
                <div
                  class="flex min-h-0 w-[200%] flex-1 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                  :class="menuLevel === 'docs' ? '-translate-x-1/2' : ''"
                >
                  <nav
                    class="flex min-h-0 w-1/2 flex-col overflow-x-hidden overflow-y-auto px-6"
                    :aria-label="t('nav.mobile')"
                    :inert="menuLevel !== 'root'"
                  >
                    <div class="m-auto w-full space-y-8 py-6">
                      <template v-for="item in rootNavItems" :key="item.href">
                        <button
                          v-if="item.drill"
                          :ref="setDrillButtonRef"
                          type="button"
                          class="group block w-full text-start"
                          @click="drillIntoDocs"
                        >
                          <span
                            class="flex items-center gap-2.5 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
                            :class="
                              isActive(item.href)
                                ? 'text-foreground'
                                : 'text-foreground/70 transition-colors group-hover:text-foreground'
                            "
                          >
                            {{ item.label }}
                            <Icon
                              name="lucide:chevron-right"
                              class="size-6 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </span>
                          <span
                            v-if="item.description"
                            class="mt-1.5 block text-sm text-muted-foreground"
                          >
                            {{ item.description }}
                          </span>
                        </button>
                        <NuxtLink v-else :to="item.href" class="group block" @click="closeMenu">
                          <span
                            class="block text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
                            :class="
                              isActive(item.href)
                                ? 'text-foreground'
                                : 'text-foreground/70 transition-colors group-hover:text-foreground'
                            "
                          >
                            {{ item.label }}
                          </span>
                          <span
                            v-if="item.description"
                            class="mt-1.5 block text-sm text-muted-foreground"
                          >
                            {{ item.description }}
                          </span>
                        </NuxtLink>
                      </template>
                    </div>
                  </nav>

                  <nav
                    v-if="hasDocsLevel"
                    class="flex min-h-0 w-1/2 flex-col px-6"
                    :aria-label="docsLevelTitle"
                    :inert="menuLevel !== 'docs'"
                  >
                    <button
                      ref="docsBackButton"
                      type="button"
                      class="flex items-center gap-1 self-start py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                      @click="backToRoot"
                    >
                      <Icon name="lucide:chevron-left" class="size-4" aria-hidden="true" />
                      {{ t("nav.menu") }}
                    </button>
                    <p
                      class="mt-1 text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground"
                    >
                      {{ docsLevelTitle }}
                    </p>
                    <div class="-mx-2 mt-3 min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4">
                      <template v-for="section in docsMenuSections" :key="section.id">
                        <p
                          v-if="section.title"
                          class="mt-6 mb-1 px-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase first:mt-2"
                        >
                          {{ section.title }}
                        </p>
                        <NuxtLink
                          v-for="link in section.links"
                          :key="link.id"
                          :to="link.href"
                          class="flex items-center rounded-md px-2 py-2 text-lg font-semibold transition-colors"
                          :class="
                            link.active
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted/60'
                          "
                          :aria-current="link.active ? 'true' : undefined"
                          @click="closeMenu"
                        >
                          {{ link.label }}
                          <span
                            v-if="link.active"
                            class="mr-1 ml-auto size-1.5 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                        </NuxtLink>
                      </template>
                    </div>
                  </nav>
                </div>

                <div class="shrink-0 border-t border-border">
                  <ClientOnly>
                    <ModeToggle variant="menu-row" />
                    <SiteLocaleSwitcher variant="menu-row" @navigate="closeMenu" />

                    <template #fallback>
                      <span class="block h-28" aria-hidden="true" />
                    </template>
                  </ClientOnly>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </header>
</template>
