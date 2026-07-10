<script setup lang="ts">
import type { VNode } from "vue";
import { Comment, cloneVNode, computed, h, ref, resolveComponent, useSlots } from "vue";
import { useClipboard } from "@vueuse/core";
import { cn } from "../../utils";

type CodeBlockProps = {
  code?: string;
  filename?: string | null;
  language?: string | null;
  meta?: string | null;
};

type CodeGroupItem = {
  code: string;
  icon?: string;
  label: string;
  node: VNode;
  value: string;
};

const slots = useSlots();
const activeValue = ref("");
const { copy, copied } = useClipboard();

const PACKAGE_ICONS: Record<string, string> = {
  bun: "logos:bun",
  npm: "logos:npm-icon",
  pnpm: "logos:pnpm",
  yarn: "logos:yarn",
};

function isRenderableNode(node: VNode) {
  return node.type !== Comment;
}

function textFromNode(input: unknown): string {
  if (typeof input === "string") return input;
  if (Array.isArray(input)) return input.map(textFromNode).join("");
  if (input && typeof input === "object" && "children" in input) {
    return textFromNode((input as VNode).children);
  }

  return "";
}

function cleanLabel(input: string | null | undefined): string {
  return (
    input
      ?.trim()
      .replace(/^\[(.*)]$/, "$1")
      .trim() || ""
  );
}

function labelFromMeta(meta: string | null | undefined): string {
  const match = meta?.match(/\[([^\]]+)]/);
  return cleanLabel(match?.[1]);
}

function nodeProps(node: VNode): CodeBlockProps {
  return (node.props || {}) as CodeBlockProps;
}

function nodeLabel(node: VNode, index: number): string {
  const props = nodeProps(node);

  return (
    cleanLabel(props.filename) ||
    labelFromMeta(props.meta) ||
    cleanLabel(props.language) ||
    `Code ${index + 1}`
  );
}

const items = computed<CodeGroupItem[]>(() =>
  (slots.default?.() || []).filter(isRenderableNode).map((node, index) => {
    const label = nodeLabel(node, index);
    const value = `${label}-${index}`;
    const normalizedLabel = label.toLowerCase();
    const props = nodeProps(node);

    return {
      code: props.code || textFromNode(node.children),
      icon: PACKAGE_ICONS[normalizedLabel],
      label,
      node,
      value,
    };
  }),
);

const activeItem = computed(() => {
  const current = items.value.find((item) => item.value === activeValue.value);
  return current || items.value[0];
});

function selectItem(value: string) {
  activeValue.value = value;
}

async function copyActiveCode() {
  await copy(activeItem.value?.code || "");
}

function renderCodeGroup() {
  if (!items.value.length) return null;
  const Icon = resolveComponent("Icon");

  return h(
    "div",
    {
      class: "content-codegroup not-prose group",
    },
    [
      h("div", { class: "content-codegroup-header" }, [
        h(
          "div",
          {
            class: "content-codegroup-tabs",
            role: "tablist",
          },
          items.value.map((item) =>
            h(
              "button",
              {
                key: item.value,
                type: "button",
                role: "tab",
                "aria-selected": activeItem.value?.value === item.value ? "true" : "false",
                class: cn(
                  "content-codegroup-tab",
                  activeItem.value?.value === item.value && "content-codegroup-tab-active",
                ),
                onClick: () => selectItem(item.value),
              },
              [
                item.icon
                  ? h(Icon, {
                      name: item.icon,
                      class: "content-codegroup-tab-icon",
                      "aria-hidden": "true",
                    })
                  : null,
                item.label,
              ],
            ),
          ),
        ),
        h(
          "button",
          {
            type: "button",
            class: "content-codeblock-copy-button content-codegroup-copy-button",
            "aria-label": copied.value ? "Copied text" : "Copy text",
            onClick: copyActiveCode,
          },
          [
            h(Icon, {
              name: copied.value ? "lucide:check" : "lucide:clipboard",
              class: "size-3.5",
              "aria-hidden": "true",
            }),
          ],
        ),
      ]),
      h(
        "div",
        {
          class: "content-codegroup-panels",
        },
        items.value.map((item) =>
          h(
            "div",
            {
              key: item.value,
              role: "tabpanel",
              style: activeItem.value?.value === item.value ? undefined : { display: "none" },
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
  <component :is="renderCodeGroup" />
</template>
