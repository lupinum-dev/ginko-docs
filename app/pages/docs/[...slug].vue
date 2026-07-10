<script setup lang="ts">
import DocsPageContent from "@/features/docs/components/DocsPageContent.vue";
import { definePageMeta } from "#imports";

definePageMeta({ layout: "docs" });
</script>

<template>
  <DocsPageContent :key="$route.path" />
</template>
