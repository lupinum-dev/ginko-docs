<script setup lang="ts">
import { definePageMeta, navigateTo, useRoute } from "#imports";
import { useDocsEntryPath } from "#ginko-docs/features/docs/composables/useDocsEntryPath";

definePageMeta({ layout: "docs" });

const route = useRoute();
const entryPath = await useDocsEntryPath();

// Redirect the bare docs root to the first documentation page. Guard against
// self-redirects when no docs pages exist (entry path falls back to the root).
if (entryPath.value && entryPath.value !== route.path) {
  await navigateTo(entryPath.value, { redirectCode: 302, replace: true });
}
</script>

<template>
  <main id="main-content" class="flex-1 px-4 py-12 md:px-6">
    <NuxtLink v-if="entryPath && entryPath !== route.path" :to="entryPath" class="underline">
      {{ entryPath }}
    </NuxtLink>
  </main>
</template>
