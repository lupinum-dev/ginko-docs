<script setup lang="ts">
import { findFirstNavigationPage } from "@lupinum/ginko-content/navigation";
import { createError, definePageMeta, navigateTo } from "#imports";
import { useDocsNavigationData } from "#ginko-docs/features/docs/composables/useDocsNavigationData";

definePageMeta({ layout: "docs" });

const { data, error } = await useDocsNavigationData();
if (error.value) throw error.value;
const entryPath = findFirstNavigationPage(data.value ?? undefined)?.path;
if (!entryPath) {
  throw createError({ statusCode: 404, statusMessage: "Documentation is empty" });
}
await navigateTo(entryPath, { redirectCode: 302, replace: true });
</script>

<template>
  <main id="main-content" />
</template>
