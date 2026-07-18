<script setup lang="ts">
import type { VNode } from "vue";
import { Comment, cloneVNode, computed, h, ref, resolveComponent, useSlots } from "vue";
import { cn } from "../../utils";
import { resolveFileIcon } from "../../utils/file-icons";

type CodeBlockProps = {
  code?: string;
  filename?: string | null;
  language?: string | null;
  meta?: string | null;
};

type TreeLeaf = {
  path: string;
  node: VNode;
};

type TreeNode = {
  label: string;
  path: string;
  children?: TreeNode[];
};

const props = defineProps<{
  /** Path of the file to show initially, e.g. "app/app.config.ts". */
  defaultValue?: string;
  expandAll?: boolean | string;
}>();

const slots = useSlots();

function isRenderableNode(node: VNode) {
  return node.type !== Comment;
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

const leaves = computed<TreeLeaf[]>(() =>
  (slots.default?.() || []).filter(isRenderableNode).map((node, index) => {
    const nodeProps = (node.props || {}) as CodeBlockProps;
    const path =
      cleanLabel(nodeProps.filename) || labelFromMeta(nodeProps.meta) || `file-${index + 1}`;
    return { path, node };
  }),
);

function buildTree(paths: string[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const root: TreeNode[] = [];

  for (const fullPath of paths) {
    const parts = fullPath.split("/");
    let path = "";

    parts.forEach((part, i) => {
      path = path ? `${path}/${part}` : part;
      if (map.has(path)) return;

      const node: TreeNode = { label: part, path, ...(i < parts.length - 1 && { children: [] }) };
      map.set(path, node);
      if (i === 0) root.push(node);
      else map.get(parts.slice(0, i).join("/"))?.children?.push(node);
    });
  }

  const sort = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .sort((a, b) =>
        !!a.children === !!b.children ? a.label.localeCompare(b.label) : b.children ? 1 : -1,
      )
      .map((node) => ({ ...node, children: node.children && sort(node.children) }));

  return sort(root);
}

const tree = computed(() => buildTree(leaves.value.map((leaf) => leaf.path)));

function ancestorsOf(path: string): string[] {
  const parts = path.split("/");
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join("/"));
}

const expandAllEnabled = computed(
  () => props.expandAll !== undefined && props.expandAll !== false && props.expandAll !== "false",
);

const selectedPath = ref(
  (props.defaultValue && leaves.value.some((leaf) => leaf.path === props.defaultValue)
    ? props.defaultValue
    : leaves.value[0]?.path) ?? "",
);

const expanded = ref(
  new Set(
    expandAllEnabled.value
      ? leaves.value.flatMap((leaf) => ancestorsOf(leaf.path))
      : ancestorsOf(selectedPath.value),
  ),
);

function toggleDir(path: string) {
  if (expanded.value.has(path)) expanded.value.delete(path);
  else expanded.value.add(path);
}

const rowClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function renderRows(nodes: TreeNode[]): (VNode | null)[] {
  const Icon = resolveComponent("Icon");

  return nodes.map((node) => {
    if (node.children) {
      const isOpen = expanded.value.has(node.path);
      return h("li", { key: node.path, role: "none" }, [
        h(
          "button",
          {
            type: "button",
            class: rowClass,
            "aria-expanded": isOpen ? "true" : "false",
            onClick: () => toggleDir(node.path),
          },
          [
            h(Icon, {
              name: "lucide:chevron-right",
              class: cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out rtl:rotate-180",
                isOpen && "rotate-90",
              ),
              "aria-hidden": "true",
            }),
            h(Icon, {
              name: isOpen ? "lucide:folder-open" : "lucide:folder",
              class: "size-4 shrink-0 text-muted-foreground",
              "aria-hidden": "true",
            }),
            h("span", { class: "min-w-0 truncate" }, node.label),
          ],
        ),
        isOpen
          ? h(
              "ul",
              { role: "group", class: "relative border-s border-border" },
              renderRows(node.children),
            )
          : null,
      ]);
    }

    const isSelected = selectedPath.value === node.path;
    return h("li", { key: node.path, role: "none" }, [
      h(
        "button",
        {
          type: "button",
          class: cn(rowClass, isSelected && "bg-primary/10 text-primary hover:bg-primary/10"),
          "aria-current": isSelected ? "true" : undefined,
          onClick: () => (selectedPath.value = node.path),
        },
        [
          h("span", { class: "size-3.5 shrink-0", "aria-hidden": "true" }),
          h(resolveComponent("Icon"), {
            name: resolveFileIcon(node.label),
            class: cn("size-4 shrink-0", isSelected ? "text-primary/80" : "text-muted-foreground"),
            "aria-hidden": "true",
          }),
          h("span", { class: "min-w-0 truncate" }, node.label),
        ],
      ),
    ]);
  });
}

function renderCodeTree() {
  if (!leaves.value.length) return null;

  return h(
    "div",
    {
      class:
        "content-code-tree not-prose my-4 grid overflow-hidden rounded-xl border bg-card text-sm text-card-foreground shadow-xs lg:h-[28rem] lg:grid-cols-3",
    },
    [
      h(
        "ul",
        {
          class:
            "content-code-tree-list max-h-60 overflow-y-auto border-b border-border lg:max-h-none lg:border-b-0 lg:border-e",
        },
        renderRows(tree.value),
      ),
      h(
        "div",
        { class: "content-code-tree-pane min-w-0 overflow-hidden lg:col-span-2" },
        leaves.value.map((leaf) =>
          h(
            "div",
            {
              key: leaf.path,
              class: "h-full",
              style: selectedPath.value === leaf.path ? undefined : { display: "none" },
            },
            [cloneVNode(leaf.node)],
          ),
        ),
      ),
    ],
  );
}
</script>

<template>
  <component :is="renderCodeTree" />
</template>
