<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Button } from "#ginko-docs/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#ginko-docs/components/ui/dropdown-menu";
import { cn } from "#ginko-docs/utils";
import { computed } from "vue";
import { useI18n } from "#imports";
import { useLocalizedRouteSwitch } from "#ginko-docs/composables/useLocalizedRouteSwitch";
import { headerUtilityButtonClass } from "#ginko-docs/components/site/header-utils";
import { locales as configuredLocales } from "../../../i18n/locales";

type LocaleSwitcherVariant = "dropdown" | "menu-row";

type LocaleEntry = {
  code: string;
  language?: string;
  name?: string;
  nativeName?: string;
  shortLabel?: string;
};

const props = withDefaults(
  defineProps<{
    variant?: LocaleSwitcherVariant;
    class?: HTMLAttributes["class"];
  }>(),
  {
    variant: "dropdown",
  },
);

const emit = defineEmits<{
  navigate: [];
}>();

const { locale, locales, t } = useI18n();
const { switchPath } = useLocalizedRouteSwitch();

type ConfiguredLocale = (typeof configuredLocales)[number];

const configuredLocaleMap: ReadonlyMap<string, ConfiguredLocale> = new Map(
  configuredLocales.map((entry) => [entry.code, entry]),
);

function normalizeLocale(entry: string | LocaleEntry) {
  if (typeof entry === "string") {
    const configured: LocaleEntry | undefined = configuredLocaleMap.get(entry);
    return {
      code: entry,
      language: configured?.language ?? entry,
      name: configured?.name ?? entry.toUpperCase(),
      nativeName: configured?.nativeName ?? configured?.name ?? entry.toUpperCase(),
      shortLabel: configured?.shortLabel ?? entry.toUpperCase(),
    };
  }

  const configured: LocaleEntry | undefined = configuredLocaleMap.get(entry.code);
  return {
    code: entry.code,
    language: entry.language ?? configured?.language ?? entry.code,
    name: entry.name ?? configured?.name ?? entry.code.toUpperCase(),
    nativeName:
      entry.nativeName ?? entry.name ?? configured?.nativeName ?? entry.code.toUpperCase(),
    shortLabel: entry.shortLabel ?? configured?.shortLabel ?? entry.code.toUpperCase(),
  };
}

const localeLinks = computed(() =>
  locales.value.map((entry) => {
    const normalized = normalizeLocale(entry as string | LocaleEntry);
    return {
      ...normalized,
      to: switchPath(normalized.code) || "/",
      current: locale.value === normalized.code,
    };
  }),
);

const currentLocale = computed(
  () => localeLinks.value.find((entry) => entry.current) ?? localeLinks.value[0],
);

function trackLocaleNavigation(_entry: { code: string; current: boolean; to: unknown }) {
  emit("navigate");
}
</script>

<template>
  <div
    v-if="localeLinks.length > 1 && variant === 'dropdown'"
    :class="cn('items-center', props.class)"
  >
    <ClientOnly>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button type="button" :class="headerUtilityButtonClass" :aria-label="t('nav.language')">
            <Icon name="lucide:languages" class="size-[18px]" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-52">
          <DropdownMenuItem v-for="entry in localeLinks" :key="entry.code" as-child>
            <NuxtLink
              :to="entry.to"
              :hreflang="entry.language"
              :lang="entry.code"
              :aria-label="entry.name"
              :aria-current="entry.current ? 'page' : undefined"
              class="flex w-full items-center gap-3"
              @click="trackLocaleNavigation(entry)"
            >
              <span class="w-7 text-xs font-semibold tracking-wide text-muted-foreground">{{
                entry.shortLabel
              }}</span>
              <span class="flex-1">{{ entry.nativeName }}</span>
              <Icon
                v-if="entry.current"
                name="lucide:check"
                class="size-4 text-foreground"
                aria-hidden="true"
              />
            </NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <template #fallback>
        <span class="inline-flex size-9 shrink-0 rounded-lg" aria-hidden="true" />
      </template>
    </ClientOnly>
  </div>

  <div
    v-else-if="localeLinks.length > 1 && variant === 'menu-row'"
    :class="cn('items-center', props.class)"
  >
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          class="h-14 w-full justify-between rounded-none px-5 text-base font-semibold hover:bg-transparent"
          :aria-label="t('nav.language')"
        >
          <span class="flex min-w-0 items-center gap-4">
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground"
            >
              <Icon name="lucide:languages" class="size-5" aria-hidden="true" />
            </span>
            <span class="truncate">{{ t("nav.languageLabel") }}</span>
          </span>
          <span class="flex items-center gap-2 text-muted-foreground">
            <span class="text-sm font-semibold text-foreground">{{
              currentLocale?.nativeName
            }}</span>
            <Icon name="lucide:chevron-down" class="size-5" aria-hidden="true" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-52" portal-disabled>
        <DropdownMenuItem v-for="entry in localeLinks" :key="entry.code" as-child>
          <NuxtLink
            :to="entry.to"
            :hreflang="entry.language"
            :lang="entry.code"
            :aria-label="entry.name"
            :aria-current="entry.current ? 'page' : undefined"
            class="flex w-full items-center gap-3"
            @click="trackLocaleNavigation(entry)"
          >
            <span class="w-7 text-xs font-semibold tracking-wide text-muted-foreground">{{
              entry.shortLabel
            }}</span>
            <span class="flex-1">{{ entry.nativeName }}</span>
            <Icon
              v-if="entry.current"
              name="lucide:check"
              class="size-4 text-foreground"
              aria-hidden="true"
            />
          </NuxtLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
