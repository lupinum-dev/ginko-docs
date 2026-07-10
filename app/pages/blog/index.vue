<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { formatContentDate } from "@/utils/content";
import { computed } from "vue";
import { definePageMeta, useContentMany, useHead, useI18n, useSeoMeta } from "#imports";
import { useCanonicalUrl } from "@/composables/useCanonicalUrl";

definePageMeta({ layout: "blog" });

const { locale, t } = useI18n();
const [{ data: posts }, { data: authors }] = await Promise.all([
  useContentMany("blog", {
    locale: () => locale.value,
    fallback: true,
    sort: { date: "desc" },
    limit: 50,
  }),
  useContentMany("authors", {
    locale: () => locale.value,
    fallback: true,
    limit: 50,
  }),
]);
const canonicalUrl = useCanonicalUrl();

const authorBySlug = computed(() => new Map(authors.value.map((author) => [author.slug, author])));

useSeoMeta({
  title: computed(() => t("blog.pageTitle")),
  description: computed(() => t("blog.description")),
  ogTitle: computed(() => t("blog.pageTitle")),
  ogDescription: computed(() => t("blog.description")),
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
});

useHead(() => ({
  link: [{ key: "canonical", rel: "canonical", href: canonicalUrl.value }],
}));
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-12">
      <h1 class="text-3xl font-semibold tracking-tight text-foreground">{{ t("blog.title") }}</h1>
      <p class="mt-2 text-muted-foreground">{{ t("blog.description") }}</p>
    </div>

    <div class="divide-y divide-border">
      <article v-for="post in posts" :key="post.path" class="group py-8">
        <NuxtLink :to="post.path" class="block">
          <div class="mb-3 flex items-center gap-2">
            <Badge v-if="post.badge" variant="secondary" class="text-xs">{{ post.badge }}</Badge>
            <span class="text-xs text-muted-foreground"
              >{{ formatContentDate(post.date, locale)
              }}<template v-if="post.readingTime"> · {{ post.readingTime }}</template></span
            >
          </div>
          <p
            v-if="authorBySlug.get(post.author)"
            class="mb-3 text-xs font-medium text-muted-foreground"
          >
            {{ authorBySlug.get(post.author)?.name }} · {{ authorBySlug.get(post.author)?.role }}
          </p>
          <h2
            class="mb-2 text-xl font-semibold text-foreground transition-colors group-hover:text-primary"
          >
            {{ post.title }}
          </h2>
          <p class="text-sm leading-relaxed text-muted-foreground">{{ post.description }}</p>
          <div class="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
            {{ t("blog.readMore") }}
            <Icon
              name="lucide:arrow-right"
              class="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </NuxtLink>
      </article>
    </div>
  </div>
</template>
