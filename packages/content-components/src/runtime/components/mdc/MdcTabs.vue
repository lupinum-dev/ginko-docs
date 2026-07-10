<script setup lang="ts">
import type { VNode } from "vue";
import { h, ref, resolveComponent, useSlots } from "vue";
import { cn } from "../../utils";
import { resolveIconifyIcon } from "./icons";

const props = withDefaults(
  defineProps<{
    variant?: "separate" | "line";
    padded?: boolean;
    inStack?: boolean;
  }>(),
  {
    variant: "separate",
    padded: true,
    inStack: false,
  },
);

const slots = useSlots();
const activeValue = ref("");

type TabItem = {
  icon?: string;
  label: string;
  node: VNode;
  value: string;
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
      value: getTabLabel(node, index),
    }));
}

function renderTabs() {
  const items = getItems();
  const Icon = resolveComponent("Icon");
  const resolvedValue = items.some((item) => item.value === activeValue.value)
    ? activeValue.value
    : activeValue.value || items[0]?.value || "";

  if (!items.length) {
    return null;
  }

  return h(
    "div",
    {
      class: cn("content-tabs not-prose group", props.inStack && "content-tabs-in-stack"),
    },
    [
      h("div", { class: "content-tabs-header" }, [
        h(
          "div",
          {
            class: "content-tabs-list",
            role: "tablist",
          },
          items.map((item) =>
            h(
              "button",
              {
                key: item.value,
                type: "button",
                role: "tab",
                "aria-selected": resolvedValue === item.value,
                class: cn(
                  "content-tabs-tab",
                  resolvedValue === item.value && "content-tabs-tab-active",
                ),
                onClick: () => {
                  activeValue.value = item.value;
                },
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
        items.map((item) =>
          h(
            "div",
            {
              key: item.value,
              value: item.value,
              role: "tabpanel",
              class: cn(
                "content-tabs-content-area content-prose content-prose-trim [&>figure:only-child]:-m-4 [&>figure:only-child]:border-none",
                props.padded ? "p-4" : "p-0",
              ),
              style: resolvedValue === item.value ? undefined : { display: "none" },
            },
            [h(item.node, { inGroup: true })],
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
