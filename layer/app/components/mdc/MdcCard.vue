<script setup lang="ts">
import { NuxtLink } from "#components";
import {
  computed,
  inject,
  useSlots,
  type ComputedRef,
  type CSSProperties,
  type HTMLAttributes,
} from "vue";
import { cn } from "../../utils";
import { isExternalLink, resolveIconifyIcon } from "./icons";
import { useProseAppearance } from "../../composables/useProseAppearance";

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
    appearance?: "quiet" | "tint";
  }>(),
  {
    showLinkIcon: true,
    horizontal: false,
    inStack: false,
  },
);

const slots = useSlots();
const inGroup = inject("contentCardInGroup", false);
// Instance prop wins, then the surrounding ::cards tray, then config.
const groupAppearance = inject<ComputedRef<"quiet" | "tint"> | null>(
  "contentCardsAppearance",
  null,
);
const appearance = useProseAppearance("cards", () => props.appearance ?? groupAppearance?.value);

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
    :data-appearance="appearance"
    :class="
      cn(
        'content-card group not-prose',
        !inStack && !inGroup && 'content-card-standalone',
        inStack && 'content-card-in-stack',
        to && 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        props.class,
      )
    "
  >
    <div data-slot="card" class="content-card-surface">
      <img v-if="img" :src="img" alt="" class="content-card-media" />

      <div
        v-if="hasHeader"
        class="content-card-header"
        :data-trailing="hasBody || hasFooter ? 'true' : undefined"
        :data-horizontal="horizontal ? 'true' : undefined"
        :data-reserve-link-icon="showOutgoingLinkIcon ? 'true' : undefined"
      >
        <div
          v-if="iconName"
          v-bind="cardIconStyle ? { style: cardIconStyle } : {}"
          class="content-card-icon content-card-tile"
        >
          <Icon :name="iconName" aria-hidden="true" />
        </div>

        <div class="content-card-copy">
          <div v-if="title || $slots.title" data-slot="card-title" class="content-card-title">
            <slot name="title">{{ title }}</slot>
          </div>
          <div
            v-if="description || $slots.description"
            data-slot="card-description"
            class="content-card-description"
          >
            <slot name="description">{{ description }}</slot>
          </div>
        </div>
      </div>

      <div
        v-if="hasBody"
        data-slot="card-content"
        class="content-card-body content-prose content-prose-trim"
        :data-reserve-link-icon="showOutgoingLinkIcon && !hasHeader ? 'true' : undefined"
      >
        <slot unwrap="p" />
      </div>

      <div v-if="hasFooter" data-slot="card-footer" class="content-card-footer">
        <slot name="footer">{{ footer }}</slot>
      </div>

      <Icon
        v-if="showOutgoingLinkIcon"
        name="lucide:arrow-up-right"
        class="content-card-arrow"
        aria-hidden="true"
      />
    </div>
  </component>
</template>
