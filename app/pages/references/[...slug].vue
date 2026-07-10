<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { createContentNotFoundError } from "@/lib/errors";
import { computed } from "vue";
import { definePageMeta, useContentOne, useHead, useI18n, useRoute, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";
import { localeFromRoutePath } from "@/utils/content";
import DocumentPageShell from "@/components/content/DocumentPageShell.vue";
import PageMarkdownCopy from "@/components/content/PageMarkdownCopy.vue";
import { Separator } from "@/components/ui/separator";
import BusinessCtaSection from "@/components/marketing/CtaSection.vue";

definePageMeta({
  layout: "default",
  content: {
    collection: "references",
  },
});

const { t } = useI18n();
const localizedPath = useLocalizedPath();
const route = useRoute();
const routeLocale = computed(() => localeFromRoutePath(route.path));
const { data: reference } = await useContentOne("references", {
  locale: () => routeLocale.value,
  fallback: true,
  by: { route: () => route.path },
});

if (import.meta.server && !reference.value) {
  throw createContentNotFoundError();
}

const canonicalUrl = useCanonicalUrl();
const pageTitle = computed(() => reference.value?.title ?? t("pages.references.fallbackTitle"));
const pageDescription = computed(
  () => reference.value?.description ?? t("pages.references.fallbackDescription"),
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
</script>

<template>
  <DocumentPageShell>
    <Button as-child variant="ghost" class="mb-8 -ml-2 text-muted-foreground">
      <NuxtLink :to="localizedPath('references')">
        <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" />
        {{ t("pages.references.back") }}
      </NuxtLink>
    </Button>

    <article v-if="reference">
      <div class="mb-10">
        <div class="mb-2 flex items-center justify-between gap-4">
          <p class="text-sm font-medium text-primary">{{ t("nav.references") }}</p>
          <PageMarkdownCopy />
        </div>
        <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {{ reference.title }}
        </h1>
        <p class="mt-4 text-lg leading-8 text-muted-foreground">{{ reference.description }}</p>
        <div class="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <p>
            <span class="font-medium text-foreground">{{ t("pages.references.client") }}:</span>
            {{ reference.client }}
          </p>
          <p>
            <span class="font-medium text-foreground">{{ t("pages.references.industry") }}:</span>
            {{ reference.industry }}
          </p>
          <p>
            <span class="font-medium text-foreground">{{ t("pages.references.result") }}:</span>
            {{ reference.outcome }}
          </p>
        </div>
      </div>

      <Separator class="mb-10" />

      <div class="content-prose">
        <ContentRenderer :value="reference" />
      </div>

      <BusinessCtaSection
        class="mt-16"
        :headline="t('pages.references.detailCtaHeadline')"
        :subline="t('pages.references.detailCtaSubline')"
        :primary-cta="{
          label: t('pages.references.detailCtaPrimary'),
          href: localizedPath('contact'),
        }"
        :secondary-cta="{
          label: t('pages.references.detailCtaSecondary'),
          href: localizedPath('services'),
        }"
      />
    </article>
  </DocumentPageShell>
</template>
