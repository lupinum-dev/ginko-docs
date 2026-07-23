<script setup lang="ts">
import type { VNode } from "vue";
import { cloneVNode, h, ref, resolveComponent, useId, useSlots } from "vue";
import { cn } from "../../utils";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { resolveIconifyIcon } from "./icons";

const props = withDefaults(
  defineProps<{
    layout?: "separate" | "line";
    appearance?: "quiet" | "tint";
    padded?: boolean;
    inStack?: boolean;
  }>(),
  {
    layout: "separate",
    padded: true,
    inStack: false,
  },
);
const appearance = useProseAppearance("tabs", () => props.appearance);

const slots = useSlots();
const activeIndex = ref(0);
const tabsId = useId();

type TabItem = {
  icon?: string;
  label: string;
  node: VNode;
};

function getTabLabel(node: VNode, index: number) {
  const label = node.props?.label;
  return typeof label === "string" && label.trim().length > 0 ? label : `Tab ${index + 1}`;
}

function getTabIcon(node: VNode) {
  const icon = node.props?.icon;
  return typeof icon === "string" ? resolveIconifyIcon(icon) : undefined;
}

function getItems(): TabItem[] {
  return (slots.default?.() ?? [])
    .filter((node): node is VNode => Boolean(node?.type))
    .map((node, index) => ({
      icon: getTabIcon(node),
      label: getTabLabel(node, index),
      node,
    }));
}

function handleKeydown(event: KeyboardEvent, items: TabItem[], currentIndex: number) {
  let nextIndex: number | undefined;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % items.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + items.length) % items.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = items.length - 1;
  if (nextIndex === undefined) return;

  event.preventDefault();
  activeIndex.value = nextIndex;
  const buttons = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>(
    '[role="tab"]',
  );
  buttons?.[nextIndex]?.focus();
}

function renderTabs() {
  const items = getItems();
  const Icon = resolveComponent("Icon");
  const resolvedIndex = Math.min(activeIndex.value, items.length - 1);

  if (!items.length) {
    return null;
  }

  return h(
    "div",
    {
      class: cn("content-tabs not-prose group", props.inStack && "content-tabs-in-stack"),
      "data-appearance": appearance.value,
      "data-layout": props.layout,
      "data-padded": props.padded ? "true" : "false",
    },
    [
      h("div", { class: "content-tabs-header" }, [
        h(
          "div",
          {
            class: "content-tabs-list",
            role: "tablist",
          },
          items.map((item, index) =>
            h(
              "button",
              {
                key: index,
                type: "button",
                role: "tab",
                id: `${tabsId}-tab-${index}`,
                "aria-controls": `${tabsId}-panel-${index}`,
                "aria-selected": resolvedIndex === index,
                tabindex: resolvedIndex === index ? 0 : -1,
                class: cn("content-tabs-tab", resolvedIndex === index && "content-tabs-tab-active"),
                onClick: () => {
                  activeIndex.value = index;
                },
                onKeydown: (event: KeyboardEvent) => handleKeydown(event, items, index),
              },
              [
                item.icon
                  ? h(Icon, {
                      name: item.icon,
                      class: "content-tabs-tab-icon",
                      "aria-hidden": "true",
                    })
                  : null,
                item.label,
              ],
            ),
          ),
        ),
      ]),
      h(
        "div",
        { class: "content-tabs-panels" },
        items.map((item, index) =>
          h(
            "div",
            {
              key: index,
              role: "tabpanel",
              id: `${tabsId}-panel-${index}`,
              "aria-labelledby": `${tabsId}-tab-${index}`,
              class: cn("content-tabs-content-area content-prose content-prose-trim"),
              style: resolvedIndex === index ? undefined : { display: "none" },
            },
            [cloneVNode(item.node, { inGroup: true })],
          ),
        ),
      ),
    ],
  );
}
</script>

<template>
  <component :is="renderTabs" />
</template>
