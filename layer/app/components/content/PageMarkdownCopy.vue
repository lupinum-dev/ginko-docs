<script setup lang="ts">
import { agentRawPathForRoute } from "@lupinum/ginko-content/client";
import { Button } from "#ginko-docs/components/ui/button";
import { ref } from "vue";
import { useRoute } from "#imports";

const props = withDefaults(
  defineProps<{
    label?: string;
    copiedLabel?: string;
  }>(),
  {
    label: "Copy Markdown",
    copiedLabel: "Copied",
  },
);

const route = useRoute();
const copied = ref(false);

async function copyMarkdown() {
  if (!navigator.clipboard?.writeText) return;

  const response = await fetch(agentRawPathForRoute(route.path), {
    headers: { accept: "text/markdown" },
  });

  if (!response.ok) return;

  await navigator.clipboard.writeText(await response.text());
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1800);
}
</script>

<template>
  <Button
    type="button"
    variant="outline"
    size="sm"
    class="h-7 shrink-0 gap-1 px-2 text-xs has-[>svg]:px-2"
    :aria-label="copied ? props.copiedLabel : props.label"
    @click="copyMarkdown"
  >
    <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="size-3.5" aria-hidden="true" />
    <span class="hidden sm:inline">{{ copied ? props.copiedLabel : props.label }}</span>
  </Button>
</template>
