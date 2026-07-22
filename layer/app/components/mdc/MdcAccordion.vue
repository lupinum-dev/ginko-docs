<script setup lang="ts">
import { onMounted, ref } from "vue";
import { AccordionRoot } from "reka-ui";
import { cn } from "../../utils";
import { useProseAppearance } from "../../composables/useProseAppearance";

const props = withDefaults(
  defineProps<{
    type?: "single" | "multiple";
    collapsible?: boolean;
    defaultValue?: string | string[];
    class?: string;
    appearance?: "quiet" | "tint";
  }>(),
  {
    type: "single",
    collapsible: true,
  },
);
const appearance = useProseAppearance("accordion", () => props.appearance);

const root = ref<HTMLElement | null>(null);
const value = ref<string | string[]>(
  props.type === "multiple"
    ? ((props.defaultValue as string[]) ?? [])
    : ((props.defaultValue as string) ?? ""),
);

function applyHash(hash: string) {
  if (!hash || !root.value) return;
  const target = root.value.querySelector<HTMLElement>(`#${CSS.escape(hash)}`);
  if (!target) return;

  const accordionValue =
    target.dataset.accordionValue ??
    target.closest("[data-accordion-value]")?.getAttribute("data-accordion-value");
  if (!accordionValue) return;

  if (props.type === "multiple") {
    const current = Array.isArray(value.value) ? value.value : [];
    value.value = current.includes(accordionValue) ? current : [accordionValue, ...current];
    return;
  }

  value.value = accordionValue;
}

onMounted(() => {
  applyHash(window.location.hash.slice(1));
});
</script>

<template>
  <div ref="root">
    <AccordionRoot
      v-model="value"
      :type="props.type"
      :collapsible="props.collapsible"
      :unmount-on-hide="false"
      data-slot="accordion"
      :data-appearance="appearance"
      :class="cn('content-accordion not-prose', props.class)"
    >
      <slot />
    </AccordionRoot>
  </div>
</template>
