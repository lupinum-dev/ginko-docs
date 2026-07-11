<script setup lang="ts">
import { createContentNotFoundError } from "#ginko-docs/lib/errors";
import { flattenTocLinks, localeFromRoutePath } from "#ginko-docs/utils/content";
import ContentFeedback from "#ginko-docs/components/content/Feedback.vue";
import DocsMobileToc from "./DocsMobileToc.vue";
import DocsPageNav from "./DocsPageNav.vue";
import DocsToc from "./DocsToc.vue";
import { computed, watch } from "vue";
import { useAppConfig, useContentPage, useHead, useI18n, useRoute, useSeoMeta } from "#imports";
import { useCanonicalUrl } from "#ginko-docs/composables/useCanonicalUrl";
import { useScrollspy } from "#ginko-docs/features/docs/composables/useScrollspy";
import PageMarkdownCopy from "#ginko-docs/components/content/PageMarkdownCopy.vue";
import { Separator } from "#ginko-docs/components/ui/separator";
import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";

type DocsNavLink = {
  path: string;
  title: string;
};

function toDocsNavLink(
  item: { path?: string; title?: string } | null | undefined,
): DocsNavLink | null {
  return item?.path && item?.title ? { path: item.path, title: item.title } : null;
}

const { t } = useI18n();
const config = useAppConfig().ginkoDocs;
const route = useRoute();
const routeLocale = computed(() => localeFromRoutePath(route.path));
const {
  page,
  previous,
  next: nextContent,
} = await useContentPage("docs", {
  locale: () => routeLocale.value,
  fallback: true,
  notFound: createContentNotFoundError,
  surround: true,
});

const siteName = computed(() => getLocalizedSiteText(config.site.name, routeLocale.value));
const pageTitle = computed(() => page.value?.title ?? t("docs.fallbackTitle"));
const pageDescription = computed(() => page.value?.description ?? t("docs.fallbackDescription"));
const canonicalUrl = useCanonicalUrl();
const tocItems = computed(() => flattenTocLinks(page.value?.body?.toc?.links));
const prev = computed(() => toDocsNavLink(previous.value));
const next = computed(() => toDocsNavLink(nextContent.value));
const { activeId, refresh } = useScrollspy(computed(() => tocItems.value.map((item) => item.id)));

watch(tocItems, () => {
  void refresh();
});

useSeoMeta({
  title: computed(() => `${pageTitle.value} - ${siteName.value}`),
  description: pageDescription,
  ogTitle: computed(() => `${pageTitle.value} - ${siteName.value}`),
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  twitterCard: "summary_large_image",
  twitterTitle: computed(() => `${pageTitle.value} - ${siteName.value}`),
  twitterDescription: pageDescription,
});

useHead(() => ({
  link: [{ key: "canonical", rel: "canonical", href: canonicalUrl.value }],
  meta: [{ property: "og:type", content: "article" }],
}));
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col xl:flex-row">
    <div class="flex min-w-0 flex-1 flex-col">
      <DocsMobileToc
        class="order-1"
        :items="tocItems"
        :active-id="activeId"
        :page-title="pageTitle"
      />

      <main
        id="main-content"
        class="order-2 mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6 xl:py-14"
      >
        <article v-if="page">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="mb-1 text-sm font-medium text-primary">{{ t("docs.label") }}</p>
              <h1
                class="font-heading text-[1.75rem] leading-9 font-semibold tracking-tight text-foreground"
              >
                {{ page.title }}
              </h1>
              <p v-if="page.description" class="mt-2 text-lg leading-7 text-muted-foreground">
                {{ page.description }}
              </p>
            </div>
            <PageMarkdownCopy />
          </div>
          <div class="mb-8" />

          <Separator class="mb-8" />

          <div class="content-prose content-prose-docs">
            <ContentRenderer :value="page" />
          </div>

          <DocsPageNav :prev="prev" :next="next" />
          <ContentFeedback :label="t('feedback.label')" />
        </article>
      </main>
    </div>

    <aside
      class="sticky top-[var(--site-header-height)] hidden h-[calc(100vh-var(--site-header-height))] w-[var(--docs-toc-width)] shrink-0 flex-col overflow-y-auto pt-10 pr-4 pb-6 xl:flex"
      :aria-label="t('docs.toc')"
    >
      <DocsToc :items="tocItems" :active-id="activeId" />
    </aside>
  </div>
</template>
