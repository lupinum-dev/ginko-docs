<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Button } from "#ginko-docs/components/ui/button";
import { computed } from "vue";
import { useColorMode, useI18n } from "#imports";
import { cn } from "#ginko-docs/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#ginko-docs/components/ui/dropdown-menu";

const props = withDefaults(
  defineProps<{
    variant?: "icon" | "menu-row" | "menu-tile";
    class?: HTMLAttributes["class"];
  }>(),
  {
    variant: "icon",
  },
);

const colorMode = useColorMode();
const { t } = useI18n();

const colorModeOptions = [
  { value: "light", labelKey: "theme.light", icon: "lucide:sun" },
  { value: "dark", labelKey: "theme.dark", icon: "lucide:moon" },
  { value: "system", labelKey: "theme.system", icon: "lucide:monitor" },
] as const;

type ColorModePreference = (typeof colorModeOptions)[number]["value"];

const selectedColorModeOption = computed(
  () =>
    colorModeOptions.find((option) => option.value === colorMode.preference) ??
    colorModeOptions.find((option) => option.value === "system")!,
);
const triggerIcon = computed(() => selectedColorModeOption.value.icon);
const nextExplicitColorModeIcon = computed(() =>
  colorMode.value === "dark" ? "lucide:sun" : "lucide:moon",
);
const triggerLabel = computed(() => t(selectedColorModeOption.value.labelKey));

function isColorModePreference(value: string): value is ColorModePreference {
  return colorModeOptions.some((option) => option.value === value);
}

function setColorModePreference(value: unknown) {
  if (typeof value === "string" && isColorModePreference(value)) {
    colorMode.preference = value;
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        v-if="variant === 'menu-row' || variant === 'menu-tile'"
        variant="ghost"
        :class="
          cn(
            variant === 'menu-tile'
              ? 'h-14 w-full justify-between rounded-none px-3.5 text-sm font-semibold hover:bg-muted/40'
              : 'h-[4.25rem] w-full justify-between rounded-none px-5 text-base font-semibold hover:bg-transparent',
            props.class,
          )
        "
      >
        <span
          class="flex min-w-0 items-center"
          :class="variant === 'menu-tile' ? 'gap-3' : 'gap-4'"
        >
          <span
            class="flex shrink-0 items-center justify-center rounded-lg bg-muted/60 text-foreground"
            :class="variant === 'menu-tile' ? 'size-8' : 'size-11'"
          >
            <Icon
              :name="triggerIcon"
              :class="variant === 'menu-tile' ? 'size-4' : 'size-5'"
              aria-hidden="true"
            />
          </span>
          <span class="truncate">{{
            variant === "menu-tile" ? triggerLabel : t("theme.label")
          }}</span>
        </span>
        <Icon
          :name="variant === 'menu-tile' ? 'lucide:chevron-down' : 'lucide:chevron-right'"
          :class="variant === 'menu-tile' ? 'size-4' : 'size-5'"
          class="text-muted-foreground"
          aria-hidden="true"
        />
      </Button>
      <Button v-else variant="outline" size="icon" :class="cn('relative shrink-0', props.class)">
        <Icon :name="nextExplicitColorModeIcon" class="size-[1.2rem]" aria-hidden="true" />
        <span class="sr-only">{{ t("theme.toggle") }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-44">
      <DropdownMenuRadioGroup
        :model-value="colorMode.preference"
        @update:model-value="setColorModePreference"
      >
        <DropdownMenuRadioItem
          v-for="option in colorModeOptions"
          :key="option.value"
          :value="option.value"
          class="gap-3"
        >
          <template #indicator-icon>
            <Icon name="lucide:check" class="size-4" aria-hidden="true" />
          </template>
          <Icon :name="option.icon" class="size-4" aria-hidden="true" />
          <span>{{ t(option.labelKey) }}</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
