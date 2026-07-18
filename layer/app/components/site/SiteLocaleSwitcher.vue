<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Button } from "#ginko-docs/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#ginko-docs/components/ui/dropdown-menu";
import { cn } from "#ginko-docs/lib/utils";
import { computed } from "vue";
import { useI18n } from "#imports";
import { useLocalizedRouteSwitch } from "#ginko-docs/composables/useLocalizedRouteSwitch";
import { locales as configuredLocales } from "../../../i18n/locales";

type LocaleSwitcherVariant = "dropdown" | "menu-row" | "menu-tile" | "segmented" | "pill";

type LocaleEntry = {
  code: string;
  language?: string;
  name?: string;
  nativeName?: string;
  shortLabel?: string;
  flagIcon?: string;
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
      flagIcon: configured?.flagIcon,
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
    flagIcon: entry.flagIcon ?? configured?.flagIcon,
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
const currentMobileLocaleLabel = computed(() => {
  const code = currentLocale.value?.code;
  if (!code) return "";
  return currentLocale.value?.name ?? code.toUpperCase();
});

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
          <Button variant="outline" class="h-9 gap-1.5 px-2.5" :aria-label="t('nav.language')">
            <Icon
              v-if="currentLocale?.flagIcon"
              :name="currentLocale.flagIcon"
              class="size-4 rounded-full"
              aria-hidden="true"
            />
            <span class="text-xs font-semibold">{{ currentLocale?.shortLabel }}</span>
            <Icon
              name="lucide:chevron-down"
              class="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-44">
          <DropdownMenuItem v-for="entry in localeLinks" :key="entry.code" as-child>
            <NuxtLink
              :to="entry.to"
              :hreflang="entry.language"
              :lang="entry.code"
              :aria-label="entry.name"
              :aria-current="entry.current ? 'page' : undefined"
              class="flex w-full items-center gap-2"
              @click="trackLocaleNavigation(entry)"
            >
              <Icon
                v-if="entry.flagIcon"
                :name="entry.flagIcon"
                class="size-4 rounded-full"
                aria-hidden="true"
              />
              <span class="flex-1">{{ entry.nativeName }}</span>
              <span class="text-xs text-muted-foreground">{{ entry.shortLabel }}</span>
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
        <span
          class="inline-flex h-9 w-[4.25rem] rounded-md border border-border bg-background"
          aria-hidden="true"
        />
      </template>
    </ClientOnly>
  </div>

  <div
    v-else-if="
      localeLinks.length > 1 &&
      (variant === 'menu-row' || variant === 'menu-tile' || variant === 'pill')
    "
    :class="cn('items-center', props.class)"
  >
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          v-if="variant === 'pill'"
          variant="outline"
          class="h-9 gap-2 rounded-full px-4 text-sm font-semibold"
          :aria-label="t('nav.language')"
        >
          <Icon
            v-if="currentLocale?.flagIcon"
            :name="currentLocale.flagIcon"
            class="size-4 rounded-full"
            aria-hidden="true"
          />
          <span>{{ currentLocale?.shortLabel }}</span>
        </Button>
        <Button
          v-else
          variant="ghost"
          :class="
            cn(
              variant === 'menu-tile'
                ? 'h-14 w-full justify-between rounded-none px-3.5 text-sm font-semibold hover:bg-muted/40'
                : 'h-[4.25rem] w-full justify-between rounded-none px-5 text-base font-semibold hover:bg-transparent',
            )
          "
          :aria-label="t('nav.language')"
        >
          <span
            class="flex min-w-0 items-center"
            :class="variant === 'menu-tile' ? 'gap-3' : 'gap-4'"
          >
            <span
              v-if="variant === 'menu-tile' && currentLocale?.flagIcon"
              class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60"
            >
              <Icon :name="currentLocale.flagIcon" class="size-5 rounded-full" aria-hidden="true" />
            </span>
            <Icon
              v-else-if="currentLocale?.flagIcon"
              :name="currentLocale.flagIcon"
              class="size-7 shrink-0 rounded-full"
              aria-hidden="true"
            />
            <span class="truncate">
              {{ variant === "menu-tile" ? currentMobileLocaleLabel : currentLocale?.shortLabel }}
            </span>
          </span>
          <Icon
            name="lucide:chevron-down"
            class="text-muted-foreground"
            :class="variant === 'menu-tile' ? 'size-4' : 'size-5'"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-44" portal-disabled>
        <DropdownMenuItem v-for="entry in localeLinks" :key="entry.code" as-child>
          <NuxtLink
            :to="entry.to"
            :hreflang="entry.language"
            :lang="entry.code"
            :aria-label="entry.name"
            :aria-current="entry.current ? 'page' : undefined"
            class="flex w-full items-center gap-2"
            @click="trackLocaleNavigation(entry)"
          >
            <Icon
              v-if="entry.flagIcon"
              :name="entry.flagIcon"
              class="size-4 rounded-full"
              aria-hidden="true"
            />
            <span class="flex-1">{{ entry.nativeName }}</span>
            <span class="text-xs text-muted-foreground">{{ entry.shortLabel }}</span>
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

  <div
    v-else-if="localeLinks.length > 1"
    :class="cn('items-center gap-1 rounded-md border border-border p-0.5', props.class)"
    :aria-label="t('nav.language')"
  >
    <NuxtLink
      v-for="entry in localeLinks"
      :key="entry.code"
      :to="entry.to"
      :hreflang="entry.language"
      :lang="entry.code"
      :aria-label="entry.name"
      :aria-current="entry.current ? 'page' : undefined"
      class="inline-flex h-8 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors"
      :class="
        entry.current
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      "
      @click="trackLocaleNavigation(entry)"
    >
      <Icon
        v-if="entry.flagIcon"
        :name="entry.flagIcon"
        class="size-4 rounded-full"
        aria-hidden="true"
      />
      <span>{{ entry.shortLabel }}</span>
    </NuxtLink>
  </div>
</template>
