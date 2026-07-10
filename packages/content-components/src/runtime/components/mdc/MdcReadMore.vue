<script setup lang="ts">
import { NuxtLink } from "#components";
import { computed, inject } from "vue";
import { cn } from "../../utils";
import { isExternalLink, resolveIconifyIcon } from "./icons";

const MDC_READ_MORE_GROUP = Symbol.for("mdc.readMoreGroup");
const inReadMoreGroup = inject(MDC_READ_MORE_GROUP, false);

const props = withDefaults(
  defineProps<{
    title?: string;
    to: string;
    target?: string;
    icon?: string;
  }>(),
  {
    icon: "lucide:bookmark",
  },
);

const label = computed(() => {
  if (props.title) return props.title;
  return props.to;
});

const iconName = computed(() => resolveIconifyIcon(props.icon));

const linkProps = computed(() => {
  if (isExternalLink(props.to)) {
    return {
      href: props.to,
      target: props.target,
      rel: "noreferrer noopener" as const,
    };
  }

  return {
    to: props.to,
    target: props.target,
  };
});

const wrapperTag = computed(() => (isExternalLink(props.to) ? "a" : NuxtLink));

const shell = computed(() => ({
  is: "div",
  class: inReadMoreGroup
    ? "contents"
    : cn(
        "relative gap-0 rounded-xl border bg-card py-4 text-card-foreground shadow-xs transition-colors",
        "group-hover:border-foreground/20 group-hover:bg-accent/50",
      ),
}));
</script>

<template>
  <component
    :is="wrapperTag"
    v-bind="linkProps"
    :class="
      cn(
        'group not-prose relative block overflow-hidden text-sm text-card-foreground transition-colors duration-200 ease-out',
        'outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        inReadMoreGroup
          ? 'my-0 rounded-none bg-transparent px-6 py-4 shadow-none hover:bg-accent/50'
          : 'my-6 cursor-pointer rounded-xl',
      )
    "
  >
    <component :is="shell.is" :class="shell.class">
      <div class="relative flex items-center gap-3" :class="inReadMoreGroup ? undefined : 'px-4'">
        <div
          v-if="iconName"
          class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground"
        >
          <Icon :name="iconName" class="size-4" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1 pr-8 leading-relaxed font-medium text-foreground">
          {{ label }}
        </div>
        <span
          class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-hover:text-foreground"
        >
          <Icon name="lucide:arrow-up-right" class="size-4 shrink-0" aria-hidden="true" />
        </span>
      </div>
    </component>
  </component>
</template>
