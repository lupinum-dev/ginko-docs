<script setup lang="ts">
import type { VNode } from "vue";
import { h, resolveComponent, useSlots } from "vue";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { resolveFileIcon } from "../../utils/file-icons";

type FileEntry = {
  name: string;
  path: string;
  children?: FileEntry[];
};

const props = defineProps<{
  active?: string;
  annotations?: Record<string, string>;
  appearance?: "quiet" | "tint";
}>();

const slots = useSlots();
const appearance = useProseAppearance("files", () => props.appearance);

function childrenOf(node: VNode): VNode[] {
  if (Array.isArray(node.children)) return node.children.filter(isVNode);
  if (node.children && typeof node.children === "object") {
    const slot = (node.children as { default?: () => unknown }).default;
    const children = typeof slot === "function" ? slot() : [];
    if (Array.isArray(children)) return children.filter(isVNode);
    return isVNode(children) ? [children] : [];
  }
  return [];
}

function isVNode(value: unknown): value is VNode {
  return value !== null && typeof value === "object" && "type" in value;
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textOf).join("");
  if (!isVNode(value)) return "";
  if (typeof value.children === "string") return value.children;
  if (value.children && typeof value.children === "object") {
    const slot = (value.children as { default?: () => unknown }).default;
    if (typeof slot === "function") return textOf(slot());
  }
  return childrenOf(value).map(textOf).join("");
}

function parseList(list: VNode, parent = ""): FileEntry[] {
  return childrenOf(list)
    .map((item) => {
      const children = childrenOf(item);
      const nested = children.length > 1 ? children.at(-1) : undefined;
      const name = children
        .filter((node) => node !== nested)
        .map(textOf)
        .join("")
        .trim();
      const path = parent ? `${parent}/${name}` : name;
      return {
        name,
        path,
        ...(nested ? { children: parseList(nested, path) } : {}),
      };
    })
    .filter((entry) => entry.name.length > 0);
}

function renderEntries(items: FileEntry[]): VNode {
  const Icon = resolveComponent("Icon");
  return h(
    "ul",
    { class: "content-files-list" },
    items.map((entry) => {
      const folder = Boolean(entry.children);
      const active = props.active === entry.path;
      return h("li", { key: entry.path, class: "content-files-item" }, [
        h(
          "div",
          {
            class: "content-files-row",
            "data-active": active || undefined,
            "aria-current": active ? "true" : undefined,
          },
          [
            h(Icon, {
              name: folder ? "lucide:folder-open" : resolveFileIcon(entry.name),
              class: "content-files-icon",
              "aria-hidden": "true",
            }),
            h("span", { class: "content-files-name" }, entry.name),
            props.annotations?.[entry.path]
              ? h("span", { class: "content-files-annotation" }, props.annotations[entry.path])
              : null,
          ],
        ),
        entry.children?.length ? renderEntries(entry.children) : null,
      ]);
    }),
  );
}

function renderFiles() {
  const list = slots.default?.()[0];
  const entries = list ? parseList(list) : [];
  if (!entries.length) return null;
  return h(
    "div",
    {
      class: "content-files not-prose",
      "data-appearance": appearance.value,
    },
    [renderEntries(entries)],
  );
}
</script>

<template>
  <component :is="renderFiles" />
</template>
