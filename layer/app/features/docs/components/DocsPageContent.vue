<script setup lang="ts">
import { createContentNotFoundError } from "#ginko-docs/lib/errors";
import { filterTocByDepth, flattenTocLinks, getMarkdownTocLinks } from "#ginko-docs/utils/content";
import ContentFeedback from "#ginko-docs/components/content/Feedback.vue";
import DocsMobileToc from "./DocsMobileToc.vue";
import DocsPageNav from "./DocsPageNav.vue";
import DocsToc from "./DocsToc.vue";
import DocsContributeLinks from "./DocsContributeLinks.vue";
import { computed, ref, watch } from "vue";
import { useAppConfig, useContentPage, useHead, useI18n, useRoute, useSeoMeta } from "#imports";
import { useCanonicalUrl } from "#ginko-docs/composables/useCanonicalUrl";
import { useGinkoOgImage } from "#ginko-docs/composables/useGinkoOgImage";
import { useScrollspy } from "#ginko-docs/features/docs/composables/useScrollspy";
import PageMarkdownCopy from "#ginko-docs/components/content/PageMarkdownCopy.vue";
import { Separator } from "#ginko-docs/components/ui/separator";
import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";
import { useSchemaJsonLd } from "#ginko-docs/composables/useSchemaJsonLd";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { useDocsNavigation } from "#ginko-docs/features/docs/composables/useDocsNavigation";
import { syncContentRouteAlternates } from "#ginko-docs/composables/useContentRouteAlternates";

type DocsNavLink = {
  path: string;
  title: string;
};

function toDocsNavLink(
  item: { path?: string; title?: string } | null | undefined,
): DocsNavLink | null {
  return item?.path && item?.title ? { path: item.path, title: item.title } : null;
}

const { locale, t } = useI18n();
const config = useAppConfig().ginkoDocs;
const route = useRoute();
const localizedPath = useLocalizedPath();
const {
  page,
  previous,
  next: nextContent,
} = await useContentPage("docs", {
  locale: () => locale.value,
  fallback: true,
  surround: true,
});
if (!page.value) throw createContentNotFoundError();
syncContentRouteAlternates(page);
const { trail } = await useDocsNavigation();

const siteName = computed(() => getLocalizedSiteText(config.site.name, locale.value));
const pageTitle = computed(() => page.value?.title ?? t("docs.fallbackTitle"));
const pageDescription = computed(() => page.value?.description ?? t("docs.fallbackDescription"));
const canonicalUrl = useCanonicalUrl();
const tocItems = computed(() =>
  filterTocByDepth(flattenTocLinks(getMarkdownTocLinks(page.value?.body)), config.toc?.depth ?? 3),
);
const prev = computed(() => toDocsNavLink(previous.value));
const next = computed(() => toDocsNavLink(nextContent.value));
const visibleTrail = computed(() => trail.value.slice(0, -1));
const schemaBreadcrumbs = computed(() => [
  { name: siteName.value, path: localizedPath("home") },
  ...trail.value
    .filter((item) => item.path)
    .map((item) => ({ name: item.title, path: item.path! })),
]);
const { activeIds, refresh } = useScrollspy(computed(() => tocItems.value.map((item) => item.id)));

watch(tocItems, () => {
  void refresh();
});

// Keep the active TOC region visible when a long TOC overflows the sticky
// aside. Instant, never animated — it must not compete with the page scroll.
const tocAside = ref<HTMLElement | null>(null);
watch(activeIds, () => {
  requestAnimationFrame(() => {
    const aside = tocAside.value;
    if (!aside || aside.scrollHeight <= aside.clientHeight) return;
    const link = aside.querySelector<HTMLElement>("[data-toc-active]");
    if (!link) return;
    const linkTop = link.getBoundingClientRect().top - aside.getBoundingClientRect().top;
    if (linkTop >= 16 && linkTop <= aside.clientHeight - 44) return;
    aside.scrollTop += linkTop - aside.clientHeight / 2;
  });
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

// Social card with the raw page title (no site-name suffix baked in).
useGinkoOgImage({
  title: pageTitle.value,
  description: pageDescription.value,
  locale: locale.value,
});

useSchemaJsonLd(() => [
  {
    "@type": "TechArticle",
    headline: pageTitle.value,
    description: pageDescription.value,
    url: canonicalUrl.value,
    inLanguage: locale.value,
    dateModified: page.value?.updated,
    isPartOf: { "@type": "WebSite", name: siteName.value, url: config.site.url },
    publisher: { "@type": "Organization", name: siteName.value, url: config.site.url },
  },
  {
    "@type": "BreadcrumbList",
    itemListElement: schemaBreadcrumbs.value.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, config.site.url).toString(),
    })),
  },
]);

function scrollToTop() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
}

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
        :active-ids="activeIds"
        :page-title="pageTitle"
      />

      <main
        id="main-content"
        class="order-2 mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6 xl:py-14"
      >
        <article v-if="page">
          <div class="flex items-start justify-between gap-4 sm:gap-6">
            <div class="min-w-0">
              <nav
                v-if="visibleTrail.length"
                class="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
                :aria-label="t('docs.breadcrumbs')"
              >
                <template v-for="(item, index) in visibleTrail" :key="item.id">
                  <Icon
                    v-if="index > 0"
                    name="lucide:chevron-right"
                    class="size-3.5 text-border"
                    aria-hidden="true"
                  />
                  <NuxtLink
                    v-if="item.path"
                    :to="item.path"
                    class="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {{ item.title }}
                  </NuxtLink>
                  <span v-else>{{ item.title }}</span>
                </template>
              </nav>
              <h1
                class="font-heading text-[2rem] leading-[1.15] font-semibold tracking-[-0.025em] text-balance text-foreground sm:text-[2.25rem]"
              >
                {{ page.title }}
              </h1>
              <p v-if="page.description" class="mt-2 text-lg leading-7 text-muted-foreground">
                {{ page.description }}
              </p>
            </div>
            <PageMarkdownCopy />
          </div>
          <Separator class="my-8" />

          <div class="content-prose content-prose-docs">
            <ContentRenderer :value="page" />
          </div>

          <DocsContributeLinks
            class="xl:hidden"
            :stem="page.stem"
            :extension="page.extension"
            :title="pageTitle"
          />
          <DocsPageNav :prev="prev" :next="next" />
          <ContentFeedback :label="t('feedback.label')" />
        </article>
      </main>
    </div>

    <aside
      ref="tocAside"
      class="sticky top-[var(--site-header-height)] hidden h-[calc(100dvh-var(--site-header-height)-var(--site-banner-height,0px))] w-[var(--docs-toc-width)] shrink-0 flex-col overflow-y-auto pt-10 pr-4 pb-6 xl:flex"
      :aria-label="t('docs.toc')"
    >
      <DocsToc class="mb-6" :items="tocItems" :active-ids="activeIds" />

      <div class="mt-auto flex flex-col gap-2.5 border-t border-border/70 pt-5">
        <DocsContributeLinks
          variant="rail"
          :stem="page?.stem"
          :extension="page?.extension"
          :title="pageTitle"
        />
        <button
          type="button"
          class="inline-flex items-center gap-1.5 self-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          @click="scrollToTop"
        >
          <Icon name="lucide:arrow-up" class="size-4" aria-hidden="true" />
          {{ t("docs.backToTop") }}
        </button>
      </div>
    </aside>
  </div>
</template>
