<script setup lang="ts">
import type { HTMLAttributes, VNode } from "vue";
import { cloneVNode, computed, h, resolveComponent, useSlots } from "vue";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { cn } from "../../utils";

const props = withDefaults(
  defineProps<{
    mode?: "icons" | "numbered";
    appearance?: "quiet" | "tint";
    class?: HTMLAttributes["class"];
  }>(),
  { mode: "icons" },
);

const slots = useSlots();
const appearance = useProseAppearance("steps", () => props.appearance);

const steps = computed(() => {
  const result: Array<{ heading: VNode; body: VNode[] }> = [];
  for (const node of slots.default?.() ?? []) {
    if (typeof node.props?.id === "string") {
      result.push({ heading: node, body: [] });
    } else if (result.length) {
      result.at(-1)!.body.push(node);
    }
  }
  return result;
});

function renderSteps() {
  const Icon = resolveComponent("Icon");
  return h(
    "div",
    {
      class: cn("content-steps not-prose", props.class),
      "data-mode": props.mode,
      "data-appearance": appearance.value,
    },
    steps.value.map((step, index) =>
      h("section", { key: index, class: "content-step" }, [
        h("span", { class: "content-step-marker", "aria-hidden": "true" }, [
          props.mode === "icons"
            ? h(Icon, { name: "lucide:check", class: "content-step-icon" })
            : String(index + 1),
        ]),
        h("div", { class: "content-step-body content-prose content-prose-trim" }, [
          cloneVNode(step.heading, { class: "content-step-title" }),
          ...step.body,
        ]),
      ]),
    ),
  );
}
</script>

<template>
  <component :is="renderSteps" />
</template>
