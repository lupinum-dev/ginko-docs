<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import ContentFeedback from "@/components/content/Feedback.vue";
import { Button } from "@/components/ui/button";
import { createContentNotFoundError } from "@/lib/errors";
import { createArticleSchema, createBreadcrumbSchema } from "@/lib/schema-org";
import { siteConfig } from "@/site.config";
import { flattenTocLinks, formatContentDate } from "@/utils/content";
import { computed } from "vue";
import { definePageMeta, useContentPage, useHead, useI18n, useSeoMeta } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";
import { useSchemaJsonLd } from "@/composables/useSchemaJsonLd";
import DocumentPageShell from "@/components/content/DocumentPageShell.vue";
import PageMarkdownCopy from "@/components/content/PageMarkdownCopy.vue";
import ContextualOfferCta from "@/components/marketing/ContextualOfferCta.vue";

definePageMeta({ layout: "blog" });

const { locale, t } = useI18n();
const localizedPath = useLocalizedPath();
const { page: post, surround } = await useContentPage("blog", {
  locale: () => locale.value,
  fallback: true,
  notFound: createContentNotFoundError,
  surround: true,
});

const pageTitle = computed(() => post.value?.title ?? t("blog.fallbackTitle"));
const pageDescription = computed(() => post.value?.description ?? t("blog.fallbackDescription"));
const canonicalUrl = useCanonicalUrl();
const tocItems = computed(() => flattenTocLinks(post.value?.body?.toc?.links));
const formattedDate = computed(() => formatContentDate(post.value?.date, locale.value));
const articleAuthor = siteConfig.identity.brandName;
const suggestions = surround;

useSeoMeta({
  title: computed(() => `${pageTitle.value} - ${siteConfig.identity.brandName}`),
  description: pageDescription,
  ogTitle: computed(() => `${pageTitle.value} - ${siteConfig.identity.brandName}`),
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
  twitterTitle: computed(() => `${pageTitle.value} - ${siteConfig.identity.brandName}`),
  twitterDescription: pageDescription,
});

useHead(() => ({
  link: [{ key: "canonical", rel: "canonical", href: canonicalUrl.value }],
  meta: [{ property: "og:type", content: "article" }],
}));

useSchemaJsonLd(() =>
  post.value
    ? [
        createBreadcrumbSchema([
          { name: t("blog.title"), path: localizedPath("blog") },
          { name: post.value.title, path: post.value.path },
        ]),
        createArticleSchema(post.value, canonicalUrl.value, articleAuthor, locale.value),
      ]
    : [],
);
</script>

<template>
  <DocumentPageShell :padded="false">
    <Button as-child variant="ghost" class="mb-8 -ml-2 text-muted-foreground">
      <NuxtLink :to="localizedPath('blog')">
        <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" />
        {{ t("blog.back") }}
      </NuxtLink>
    </Button>

    <div v-if="post" class="mb-12">
      <div class="mb-12 flex items-center justify-between gap-4">
        <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <Badge v-if="post.badge" variant="secondary">{{ post.badge }}</Badge>
          <span class="text-sm text-muted-foreground"
            >{{ formattedDate
            }}<template v-if="post.readingTime"> · {{ post.readingTime }}</template></span
          >
          <span class="hidden text-sm text-muted-foreground sm:inline" aria-hidden="true"> · </span>
          <span class="text-sm text-muted-foreground">{{ articleAuthor }}</span>
        </div>
        <PageMarkdownCopy />
      </div>
      <h1
        class="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl"
      >
        {{ post.title }}
      </h1>
      <p class="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">{{ post.description }}</p>
    </div>

    <nav
      v-if="tocItems.length"
      :aria-label="t('blog.toc')"
      class="not-prose mx-auto mb-12 max-w-[44rem] border-y border-border py-7"
    >
      <p class="mb-6 text-sm font-semibold text-foreground">{{ t("blog.toc") }}</p>
      <ol class="grid gap-x-12 gap-y-2 sm:grid-cols-2" role="list">
        <li v-for="(item, index) in tocItems" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="group grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-md py-1.5 transition-colors hover:bg-accent/45 sm:-mx-2 sm:px-2"
          >
            <span
              class="pt-0.5 font-mono text-xs leading-6 text-muted-foreground tabular-nums transition-colors group-hover:text-foreground/70"
            >
              {{ String(index + 1).padStart(2, "0") }}
            </span>
            <span
              class="text-sm leading-6 text-foreground/80 transition-colors group-hover:text-foreground"
              :class="item.depth === 3 ? 'pl-3 text-muted-foreground' : ''"
            >
              {{ item.label }}
            </span>
          </a>
        </li>
      </ol>
    </nav>

    <div v-if="post" class="content-prose mx-auto max-w-[42rem]">
      <ContentRenderer :value="post" />
    </div>

    <ContentFeedback :label="t('feedback.articleLabel')" />
    <ContextualOfferCta compact />

    <div v-if="suggestions.length" class="mt-14">
      <h2 class="mb-6 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        {{ t("blog.moreArticles") }}
      </h2>
      <div class="divide-y divide-border border-y border-border">
        <NuxtLink
          v-for="p in suggestions"
          :key="p.path"
          :to="p.path"
          class="group grid grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-4 py-6 transition-colors hover:bg-accent/35 sm:px-2"
        >
          <h3
            class="font-serif text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary"
          >
            {{ p.title }}
          </h3>
          <Icon
            name="lucide:arrow-right"
            class="hidden size-4 self-center text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary sm:block"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </div>
  </DocumentPageShell>
</template>
