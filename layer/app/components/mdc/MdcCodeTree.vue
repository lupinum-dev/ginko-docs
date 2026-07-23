<script setup lang="ts">
import type { VNode } from "vue";
import { Comment, cloneVNode, h, ref, resolveComponent, useSlots } from "vue";
import { cn } from "../../utils";
import { resolveFileIcon } from "../../utils/file-icons";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { validateCodeTreePaths } from "./code-tree.utils";

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
  expandAll?: boolean;
  appearance?: "quiet" | "tint";
}>();
const appearance = useProseAppearance("code", () => props.appearance);

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

function resolveLeaves(): TreeLeaf[] {
  const leaves = (slots.default?.() || []).filter(isRenderableNode).map((node) => {
    const nodeProps = (node.props || {}) as CodeBlockProps;
    const path = cleanLabel(nodeProps.filename) || labelFromMeta(nodeProps.meta);
    if (!path) throw new TypeError("Every code tree block requires a filename label");
    return { path, node };
  });
  validateCodeTreePaths(
    leaves.map((leaf) => leaf.path),
    props.defaultValue,
  );
  return leaves;
}

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

function ancestorsOf(path: string): string[] {
  const parts = path.split("/");
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join("/"));
}

const selectedPath = ref(props.defaultValue ?? "");
const expanded = ref(new Set<string>());
const expansionChanged = ref(false);

function toggleDir(path: string, initial: Set<string>) {
  if (!expansionChanged.value) {
    expanded.value = new Set(initial);
    expansionChanged.value = true;
  }
  if (expanded.value.has(path)) expanded.value.delete(path);
  else expanded.value.add(path);
}

const rowClass = "content-code-tree-row";

function renderRows(
  nodes: TreeNode[],
  openPaths: Set<string>,
  activePath: string,
): (VNode | null)[] {
  const Icon = resolveComponent("Icon");

  return nodes.map((node) => {
    if (node.children) {
      const isOpen = openPaths.has(node.path);
      return h("li", { key: node.path, role: "none" }, [
        h(
          "button",
          {
            type: "button",
            class: rowClass,
            "aria-expanded": isOpen ? "true" : "false",
            onClick: () => toggleDir(node.path, openPaths),
          },
          [
            h(Icon, {
              name: "lucide:chevron-right",
              class: "content-code-tree-chevron",
              "data-open": isOpen ? "true" : undefined,
              "aria-hidden": "true",
            }),
            h(Icon, {
              name: isOpen ? "lucide:folder-open" : "lucide:folder",
              class: "content-code-tree-icon",
              "aria-hidden": "true",
            }),
            h("span", { class: "content-code-tree-label" }, node.label),
          ],
        ),
        isOpen
          ? h(
              "ul",
              { role: "group", class: "content-code-tree-branch" },
              renderRows(node.children, openPaths, activePath),
            )
          : null,
      ]);
    }

    const isSelected = activePath === node.path;
    return h("li", { key: node.path, role: "none" }, [
      h(
        "button",
        {
          type: "button",
          class: cn(rowClass, isSelected && "content-code-tree-row-active"),
          "aria-current": isSelected ? "true" : undefined,
          onClick: () => (selectedPath.value = node.path),
        },
        [
          h("span", { class: "content-code-tree-spacer", "aria-hidden": "true" }),
          h(resolveComponent("Icon"), {
            name: resolveFileIcon(node.label),
            class: "content-code-tree-icon",
            "aria-hidden": "true",
          }),
          h("span", { class: "content-code-tree-label" }, node.label),
        ],
      ),
    ]);
  });
}

function renderCodeTree() {
  const leaves = resolveLeaves();
  if (!leaves.length) return null;
  const activePath = leaves.some((leaf) => leaf.path === selectedPath.value)
    ? selectedPath.value
    : leaves[0]!.path;
  const initialOpenPaths = new Set(
    props.expandAll ? leaves.flatMap((leaf) => ancestorsOf(leaf.path)) : ancestorsOf(activePath),
  );
  const openPaths = expansionChanged.value ? expanded.value : initialOpenPaths;
  const tree = buildTree(leaves.map((leaf) => leaf.path));

  return h(
    "div",
    {
      class: "content-code-tree not-prose",
      "data-appearance": appearance.value,
    },
    [
      h(
        "ul",
        {
          class: "content-code-tree-list",
        },
        renderRows(tree, openPaths, activePath),
      ),
      h(
        "div",
        { class: "content-code-tree-pane" },
        leaves.map((leaf) =>
          h(
            "div",
            {
              key: leaf.path,
              class: "content-code-tree-panel",
              style: activePath === leaf.path ? undefined : { display: "none" },
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
