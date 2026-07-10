<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { createContentNotFoundError } from "@/lib/errors";
import { createBreadcrumbSchema, createServiceSchema } from "@/lib/schema-org";
import { computed } from "vue";
import { definePageMeta, useContentOne, useHead, useI18n, useRoute, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";
import { useSchemaJsonLd } from "@/composables/useSchemaJsonLd";
import { localeFromRoutePath } from "@/utils/content";
import DocumentPageShell from "@/components/content/DocumentPageShell.vue";
import PageMarkdownCopy from "@/components/content/PageMarkdownCopy.vue";
import { Separator } from "@/components/ui/separator";

definePageMeta({
  layout: "default",
  content: {
    collection: "services",
  },
});

const { t } = useI18n();
const localizedPath = useLocalizedPath();
const route = useRoute();
const routeLocale = computed(() => localeFromRoutePath(route.path));
const { data: service } = await useContentOne("services", {
  locale: () => routeLocale.value,
  fallback: true,
  by: { route: () => route.path },
});

if (import.meta.server && !service.value) {
  throw createContentNotFoundError();
}

const canonicalUrl = useCanonicalUrl();
const pageTitle = computed(() => service.value?.title ?? t("pages.services.fallbackTitle"));
const pageDescription = computed(
  () => service.value?.description ?? t("pages.services.fallbackDescription"),
);

useSeoMeta({
  title: computed(() => `${pageTitle.value} - ${t("site.name")}`),
  description: pageDescription,
  ogTitle: computed(() => `${pageTitle.value} - ${t("site.name")}`),
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
});

useHead(() => ({
  link: [{ key: "canonical", rel: "canonical", href: canonicalUrl.value }],
}));

useSchemaJsonLd(() =>
  service.value
    ? [
        createBreadcrumbSchema([
          { name: t("nav.services"), path: localizedPath("services") },
          { name: service.value.title, path: route.path },
        ]),
        createServiceSchema(service.value, canonicalUrl.value, routeLocale.value),
      ]
    : [],
);
</script>

<template>
  <DocumentPageShell>
    <Button as-child variant="ghost" class="mb-8 -ml-2 text-muted-foreground">
      <NuxtLink :to="localizedPath('services')">
        <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" />
        {{ t("pages.services.back") }}
      </NuxtLink>
    </Button>

    <article v-if="service">
      <div class="mb-10">
        <div class="mb-2 flex items-center justify-between gap-4">
          <p class="text-sm font-medium text-primary">{{ t("nav.services") }}</p>
          <PageMarkdownCopy />
        </div>
        <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {{ service.title }}
        </h1>
        <p class="mt-4 text-lg leading-8 text-muted-foreground">{{ service.description }}</p>
        <p v-if="service.outcome" class="mt-5 text-sm font-medium text-foreground">
          {{ service.outcome }}
        </p>
      </div>

      <Separator class="mb-10" />

      <div class="content-prose">
        <ContentRenderer :value="service" />
      </div>
    </article>
  </DocumentPageShell>
</template>
