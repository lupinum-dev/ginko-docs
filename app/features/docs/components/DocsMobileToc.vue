<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { ref, watch } from "vue";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import DocsSidebar from "./DocsSidebar.vue";
import type { TocItem } from "./DocsToc.vue";
import DocsToc from "./DocsToc.vue";
import { useI18n, useRoute } from "#imports";

const props = defineProps<{
  items: TocItem[];
  activeId?: string;
  pageTitle?: string;
  class?: HTMLAttributes["class"];
}>();

const sidebarOpen = ref(false);
const tocOpen = ref(false);
const route = useRoute();
const { t } = useI18n();

watch(
  () => route.hash,
  () => {
    tocOpen.value = false;
  },
);
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
    tocOpen.value = false;
  },
);
</script>

<template>
  <div
    :class="
      cn(
        'sticky top-[var(--site-header-height)] z-30 flex h-11 shrink-0 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:px-6 xl:hidden',
        props.class,
      )
    "
  >
    <Sheet v-model:open="sidebarOpen">
      <SheetTrigger as-child>
        <button
          type="button"
          class="-ml-1 flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          :aria-label="t('docs.pageNavigation')"
        >
          <Icon
            name="lucide:panel-left-open"
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span class="truncate">{{ pageTitle ?? t("docs.fallbackTitle") }}</span>
        </button>
      </SheetTrigger>

      <SheetContent side="left" class="flex w-[20rem] max-w-[86vw] flex-col gap-0 p-0">
        <div class="border-b border-border px-4 py-3">
          <SheetTitle class="text-sm font-semibold">{{ t("docs.label") }}</SheetTitle>
          <SheetDescription class="sr-only">{{ t("docs.pageNavigation") }}</SheetDescription>
        </div>
        <div class="min-h-0 flex-1">
          <DocsSidebar variant="drawer" />
        </div>
      </SheetContent>
    </Sheet>

    <Sheet v-if="items.length" v-model:open="tocOpen">
      <SheetTrigger as-child>
        <button
          class="-mr-1 flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon name="lucide:list" class="size-3.5" aria-hidden="true" />
          <span>{{ t("docs.toc") }}</span>
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" class="flex max-h-[85dvh] flex-col gap-0 rounded-t-2xl p-0">
        <div class="flex shrink-0 flex-col items-center border-b border-border px-6 pt-3 pb-4">
          <div class="mb-4 h-1 w-10 rounded-full bg-border" />
          <SheetTitle class="self-start text-sm font-semibold">{{ t("docs.toc") }}</SheetTitle>
          <SheetDescription class="sr-only">{{
            pageTitle ?? t("docs.fallbackTitle")
          }}</SheetDescription>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5" @click="tocOpen = false">
          <DocsToc :items="items" :active-id="activeId" :show-title="false" />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
