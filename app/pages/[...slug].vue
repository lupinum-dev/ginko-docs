<script setup lang="ts">
import { siteConfig } from "@/site.config";
import { getLocalizedSiteText } from "@/config/site.utils";
import { createContentNotFoundError } from "@/lib/errors";
import { flattenTocLinks, localeFromRoutePath, toRootMountedContentPath } from "@/utils/content";
import { computed } from "vue";
import { definePageMeta, useContentOne, useRoute, useSeoMeta } from "#imports";
import DocumentPageShell from "@/components/content/DocumentPageShell.vue";
import PageMarkdownCopy from "@/components/content/PageMarkdownCopy.vue";

definePageMeta({ layout: "default" });

const route = useRoute();
const routeLocale = computed(() => localeFromRoutePath(route.path));
const contentPath = computed(() => toRootMountedContentPath(route.path, routeLocale.value));
const { data: page } = await useContentOne("legal", {
  locale: () => routeLocale.value,
  fallback: true,
  by: { path: () => contentPath.value },
});

if (import.meta.server && !page.value) {
  throw createContentNotFoundError();
}

const title = computed(() => page.value?.title ?? siteConfig.identity.brandName);
const description = computed(
  () =>
    page.value?.description ?? getLocalizedSiteText(siteConfig.site.description, routeLocale.value),
);
const updated = computed(() => page.value?.updated ?? siteConfig.legal.lastUpdated);
const tocItems = computed(() => flattenTocLinks(page.value?.body?.toc?.links));

useSeoMeta({
  title: computed(() => `${title.value} - ${siteConfig.identity.brandName}`),
  description,
});
</script>

<template>
  <DocumentPageShell :toc-items="tocItems">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-3xl font-semibold tracking-tight text-foreground">{{ title }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ routeLocale === "de" ? "Zuletzt aktualisiert" : "Last updated" }}: {{ updated }}
        </p>
      </div>
      <PageMarkdownCopy />
    </div>

    <div v-if="page" class="content-prose mt-10">
      <ContentRenderer :value="page" />
    </div>
  </DocumentPageShell>
</template>
