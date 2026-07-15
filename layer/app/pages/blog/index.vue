<script setup lang="ts">
import { Badge } from "#ginko-docs/components/ui/badge";
import { many } from "@lupinum/ginko-content/client";
import { formatContentDate } from "#ginko-docs/utils/content";
import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";
import { computed } from "vue";
import { definePageMeta, useAppConfig, useAsyncData, useHead, useI18n, useSeoMeta } from "#imports";
import { useCanonicalUrl } from "#ginko-docs/composables/useCanonicalUrl";

definePageMeta({ layout: "blog" });

const { locale, t } = useI18n();
const postsKey = computed(() => `blog-posts:${locale.value}`);
const { data: posts } = await useAsyncData(
  postsKey,
  () =>
    many("blog", {
      locale: locale.value,
      fallback: true,
      populate: { author: "authors" },
      sort: { date: "desc" },
      limit: 50,
    }),
  { watch: [locale] },
);
const canonicalUrl = useCanonicalUrl();
const config = useAppConfig().ginkoDocs;
const siteName = computed(() => getLocalizedSiteText(config.site.name, locale.value));
const fullTitle = computed(() => `${t("blog.pageTitle")} - ${siteName.value}`);

useSeoMeta({
  title: fullTitle,
  description: computed(() => t("blog.description")),
  ogTitle: fullTitle,
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
      <article v-for="post in posts" :key="post.route.resolvedPath" class="group py-8">
        <NuxtLink
          :to="post.route.resolvedPath"
          class="flex flex-col gap-6 sm:flex-row sm:items-start"
        >
          <div class="min-w-0 flex-1">
            <div class="mb-3 flex items-center gap-2">
              <Badge v-if="post.badge" variant="secondary" class="text-xs">{{ post.badge }}</Badge>
              <span class="text-xs text-muted-foreground"
                >{{ formatContentDate(post.date, locale)
                }}<template v-if="post.readingTime"> · {{ post.readingTime }}</template></span
              >
            </div>
            <div v-if="post.author" class="mb-3 flex items-center gap-2">
              <img
                v-if="post.author.avatar"
                :src="post.author.avatar"
                :alt="post.author.name"
                class="size-5 shrink-0 rounded-full border border-border object-cover"
                loading="lazy"
              />
              <p class="text-xs font-medium text-muted-foreground">
                {{ post.author.name }} · {{ post.author.role }}
              </p>
            </div>
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
          </div>
          <NuxtImg
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            class="aspect-[16/10] w-full shrink-0 rounded-lg border border-border object-cover sm:w-52"
            width="416"
            height="260"
            loading="lazy"
          />
        </NuxtLink>
      </article>
    </div>
  </div>
</template>
