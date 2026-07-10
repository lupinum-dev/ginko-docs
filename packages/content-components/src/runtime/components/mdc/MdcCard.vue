<script setup lang="ts">
import { NuxtLink } from "#components";
import { computed, inject, useSlots, type CSSProperties, type HTMLAttributes } from "vue";
import { cn } from "../../utils";
import { isExternalLink, resolveIconifyIcon } from "./icons";

type CardIconColor =
  | "muted"
  | "foreground"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "destructive";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    footer?: string;
    to?: string;
    target?: string;
    icon?: string;
    iconColor?: CardIconColor;
    img?: string;
    showLinkIcon?: boolean;
    horizontal?: boolean;
    inStack?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  {
    showLinkIcon: true,
    horizontal: false,
    inStack: false,
  },
);

const slots = useSlots();
const inGroup = inject("contentCardInGroup", false);

const wrapperTag = computed(() => (props.to ? (isExternalLink(props.to) ? "a" : NuxtLink) : "div"));

const linkProps = computed(() => {
  if (!props.to) return null;
  if (isExternalLink(props.to)) {
    return {
      href: props.to,
      target: props.target,
      rel: "noreferrer noopener",
    };
  }
  return {
    to: props.to,
    target: props.target,
  };
});

const iconName = computed(() => resolveIconifyIcon(props.icon));

const hasHeader = computed(() =>
  Boolean(props.title || props.description || slots.title || slots.description || props.icon),
);

const hasFooter = computed(() => Boolean(props.footer || slots.footer));

const hasBody = computed(() => Boolean(slots.default));

const showOutgoingLinkIcon = computed(
  () => props.showLinkIcon && Boolean(props.to && isExternalLink(props.to)),
);

const cardIconColor = computed(() => {
  if (!props.iconColor || props.iconColor === "muted") return undefined;

  return {
    foreground: "var(--foreground)",
    primary: "var(--primary)",
    info: "var(--info)",
    success: "var(--success)",
    warning: "var(--warning)",
    destructive: "var(--destructive)",
  }[props.iconColor];
});

const cardIconStyle = computed<CSSProperties | undefined>(() =>
  cardIconColor.value
    ? ({ "--content-card-icon-color": cardIconColor.value } as CSSProperties)
    : undefined,
);
</script>

<template>
  <component
    :is="wrapperTag"
    v-bind="linkProps || {}"
    :class="
      cn(
        'content-card group not-prose relative block h-auto',
        !inStack && !inGroup && 'my-4',
        to &&
          'rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        props.class,
      )
    "
  >
    <div
      data-slot="card"
      :class="
        cn(
          'content-card-surface relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-colors',
          hasBody || hasFooter ? 'p-0' : 'p-0',
          to && 'cursor-pointer hover:bg-accent/50',
          showOutgoingLinkIcon && (hasBody || hasFooter ? '' : 'pr-10'),
          inStack &&
            'rounded-none border-x-0 shadow-none first:rounded-t-xl first:border-t last:rounded-b-xl last:border-b',
        )
      "
    >
      <img v-if="img" :src="img" alt="" class="w-full border-b border-border object-cover" />

      <div
        v-if="hasHeader"
        :class="
          cn(
            hasBody || hasFooter ? 'p-4 pb-0' : 'p-4',
            showOutgoingLinkIcon && 'pr-10',
            horizontal && 'flex items-start gap-3',
          )
        "
      >
        <div
          v-if="iconName"
          :style="cardIconStyle"
          :class="
            cn(
              'content-card-icon flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted shadow-xs [&_.iconify]:size-5',
              horizontal ? '' : 'mb-2',
            )
          "
        >
          <Icon :name="iconName" aria-hidden="true" />
        </div>

        <div :class="cn('min-w-0', horizontal ? 'flex-1 space-y-1' : 'space-y-1')">
          <div
            v-if="title || $slots.title"
            data-slot="card-title"
            :class="cn('text-sm font-medium', !horizontal && 'mb-0')"
          >
            <slot name="title">{{ title }}</slot>
          </div>
          <div
            v-if="description || $slots.description"
            data-slot="card-description"
            class="text-sm leading-snug text-pretty"
          >
            <slot name="description">{{ description }}</slot>
          </div>
        </div>
      </div>

      <div
        v-if="hasBody"
        data-slot="card-content"
        class="content-prose content-prose-trim p-4 pt-2 text-muted-foreground"
      >
        <slot unwrap="p" />
      </div>

      <div
        v-if="hasFooter"
        data-slot="card-footer"
        class="flex flex-col items-stretch border-t px-4 py-3 text-xs text-muted-foreground [&_p]:my-0 [&_p]:leading-normal"
      >
        <slot name="footer">{{ footer }}</slot>
      </div>

      <Icon
        v-if="showOutgoingLinkIcon"
        name="lucide:arrow-up-right"
        class="pointer-events-none absolute top-4 right-4 size-4 text-muted-foreground/50 transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
    </div>
  </component>
</template>
