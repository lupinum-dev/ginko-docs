<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted } from "vue";
import SiteSearchPageHighlight from "#ginko-docs/features/search/components/SiteSearchPageHighlight.vue";
import { useCommandCenterState } from "#ginko-docs/features/search/useCommandCenter";

const SiteCommandCenter = defineAsyncComponent(
  () => import("#ginko-docs/features/search/components/SiteCommandCenter.vue"),
);
const { open, openCommandCenter } = useCommandCenterState();

function handleGlobalShortcut(event: KeyboardEvent) {
  const element = event.target as HTMLElement | null;
  const typing =
    element instanceof HTMLElement &&
    (element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName));

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandCenter();
  } else if (!typing && event.key === "/") {
    event.preventDefault();
    openCommandCenter();
  }
}

onMounted(() => window.addEventListener("keydown", handleGlobalShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleGlobalShortcut));
</script>

<template>
  <ClientOnly>
    <SiteCommandCenter v-if="open" />
    <SiteSearchPageHighlight />
  </ClientOnly>
</template>
