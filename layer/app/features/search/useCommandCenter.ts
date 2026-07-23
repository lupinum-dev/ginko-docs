import { useLocalStorage } from "@vueuse/core";
import { useContentSearch } from "@lupinum/ginko-content/client";
import { computed, watch } from "vue";
import { navigateTo, useI18n, useRoute, useState } from "#imports";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";
import {
  getDocsNavigationGroups,
  type DocsNavigationItem,
} from "#ginko-docs/features/docs/docs-navigation";
import { useDocsEntryPath } from "#ginko-docs/features/docs/composables/useDocsEntryPath";
import { useDocsNavigation } from "#ginko-docs/features/docs/composables/useDocsNavigation";
import {
  dedupeCommandCenterItems,
  groupCommandCenterItems,
  PAGE_HIGHLIGHT_STORAGE_KEY,
  rememberRecentItem,
  resolveRecentItems,
  type CommandCenterItem,
  type StoredRecentItem,
} from "#ginko-docs/features/search/command-center";

const MAX_DEFAULT_PAGE_ITEMS = 6;
const MAX_DEFAULT_DOC_ITEMS = 3;

export function useCommandCenterState() {
  const open = useState<boolean>("site-command-center-open", () => false);
  const query = useState<string>("site-command-center-query", () => "");

  function closeCommandCenter() {
    open.value = false;
    query.value = "";
  }

  function openCommandCenter(initialQuery = "") {
    query.value = initialQuery;
    open.value = true;
  }

  return {
    open,
    query,
    openCommandCenter,
    closeCommandCenter,
  };
}

function flattenNavItems(items: DocsNavigationItem[]): DocsNavigationItem[] {
  const output: DocsNavigationItem[] = [];
  for (const item of items) {
    output.push(item);
    if (item.children.length > 0) {
      output.push(...flattenNavItems(item.children));
    }
  }
  return output;
}

export async function useCommandCenter() {
  const route = useRoute();
  const { locale, t } = useI18n();
  const localizedPath = useLocalizedPath();
  const {
    open,
    query,
    openCommandCenter,
    closeCommandCenter: closeState,
  } = useCommandCenterState();
  const recentSelections = useLocalStorage<StoredRecentItem[]>("site-command-center-recent", []);

  const { mainNav, footerNav, socialLinks } = useSiteNavigation();
  // Start every context-bound composable before the first await. Calling a
  // Nuxt/i18n composable after an awaited operation loses the setup context.
  const docsEntryPathResult = useDocsEntryPath();
  const docsNavigationResult = useDocsNavigation();
  const contentSearchResult = useContentSearch({
    limit: 12,
    locale: () => locale.value,
  });
  const [
    docsEntryPath,
    { sections },
    {
      query: searchQuery,
      results: searchResults,
      pending: searchPending,
      error: searchError,
      isEmpty: searchIsEmpty,
    },
  ] = await Promise.all([docsEntryPathResult, docsNavigationResult, contentSearchResult]);

  const contentSearchItems = computed<CommandCenterItem[]>(() =>
    searchResults.value.map((hit) => {
      const href = hit.anchor ? `${hit.path}#${hit.anchor}` : hit.path;

      return {
        id: `search-${href}`,
        title: hit.title,
        subtitle: hit.excerpt,
        href,
        group: "search",
        icon: hit.collection === "blog" ? "lucide:newspaper" : "lucide:book-open",
        badge: hit.collection === "blog" ? t("nav.blog") : t("docs.label"),
      };
    }),
  );

  const pageItems = computed<CommandCenterItem[]>(() => {
    const featured: CommandCenterItem[] = [
      {
        id: "page-home",
        title: t("command.pages.home.title"),
        subtitle: t("command.pages.home.description"),
        href: localizedPath("home"),
        group: "pages",
        icon: "lucide:home",
        keywords: ["landing", "overview", "hero"],
      },
    ];

    const fromMainNav = mainNav.value.map<CommandCenterItem>((item) => ({
      id: `page-main-${item.href}`,
      title: item.label,
      subtitle: t("command.pages.primary"),
      href: item.href,
      group: "pages",
      icon: item.href === localizedPath("blog") ? "lucide:newspaper" : "lucide:file-text",
      keywords: ["navigation", item.label],
    }));

    const footerResources = [
      { label: t("nav.documentation"), href: docsEntryPath.value },
      ...footerNav.value.resources,
    ];
    const fromFooter = [...footerNav.value.product, ...footerResources, ...footerNav.value.company]
      .filter((item) => !(item as { external?: boolean }).external)
      .map<CommandCenterItem>((item) => ({
        id: `page-footer-${item.href}`,
        title: item.label,
        subtitle: t("command.pages.secondary"),
        href: item.href,
        group: "pages",
        icon: "lucide:file-text",
        keywords: ["footer", item.label],
      }));

    return dedupeCommandCenterItems([...featured, ...fromMainNav, ...fromFooter]);
  });

  const docsItems = computed<CommandCenterItem[]>(() => {
    const navigationEntries = sections.value.flatMap((section) =>
      getDocsNavigationGroups(section).flatMap((group) =>
        flattenNavItems(group.items)
          .filter((item) => item.path)
          .map<CommandCenterItem>((item) => ({
            id: `doc-${item.path}`,
            title: item.title,
            subtitle: group.title ?? section.title ?? t("docs.label"),
            href: item.path,
            group: "docs_nav",
            icon: item.icon ?? "lucide:book-open",
            keywords: [section.title ?? "", group.title ?? "", item.badge ?? "", item.title],
            badge: item.badge,
          })),
      ),
    );

    const sectionIndexEntries = sections.value.flatMap<CommandCenterItem>((section) =>
      section.path && section.title
        ? [
            {
              id: `doc-section-${section.path}`,
              title: section.title,
              subtitle: t("command.pages.documentation"),
              href: section.path,
              group: "docs_nav",
              icon: section.icon ?? "lucide:book-open",
              keywords: [section.title],
            },
          ]
        : [],
    );

    return dedupeCommandCenterItems([...sectionIndexEntries, ...navigationEntries]);
  });

  const actionItems = computed<CommandCenterItem[]>(() => {
    const github = socialLinks.value.find((item) => item.icon === "lucide:github");
    return github
      ? [
          {
            id: "action-github",
            title: t("command.actions.github.title"),
            subtitle: t("command.actions.github.description"),
            href: github.href,
            external: true,
            group: "actions" as const,
            icon: "lucide:github",
            keywords: ["repo", "source", "code"],
          },
        ]
      : [];
  });

  const canonicalItems = computed(() =>
    dedupeCommandCenterItems([...pageItems.value, ...docsItems.value, ...actionItems.value]),
  );

  const recentItems = computed<CommandCenterItem[]>(() => {
    if (query.value) return [];

    return resolveRecentItems(recentSelections.value, canonicalItems.value);
  });

  const defaultItems = computed<CommandCenterItem[]>(() => {
    const recentSourceIds = new Set(recentItems.value.map((item) => item.sourceId));
    const docSectionItems = docsItems.value.slice(0, MAX_DEFAULT_DOC_ITEMS);

    return dedupeCommandCenterItems([
      ...pageItems.value.slice(0, MAX_DEFAULT_PAGE_ITEMS),
      ...docSectionItems,
      ...actionItems.value,
    ]).filter((item) => !recentSourceIds.has(item.id));
  });

  const groupedItems = computed(() => {
    if (query.value.trim()) {
      return contentSearchItems.value.length
        ? [
            {
              id: "search" as const,
              title: t("command.groups.search"),
              items: contentSearchItems.value,
            },
          ]
        : [];
    }
    return groupCommandCenterItems([...recentItems.value, ...defaultItems.value], (group) =>
      t(`command.groups.${group}`),
    );
  });

  function rememberSelection(item: CommandCenterItem) {
    const canonicalItem =
      item.group === "search"
        ? canonicalItems.value.find((candidate) => candidate.href === item.href)
        : item;
    if (canonicalItem) {
      recentSelections.value = rememberRecentItem(canonicalItem, recentSelections.value);
    }
  }

  function closeCommandCenter() {
    closeState();
    searchQuery.value = "";
  }

  async function selectItem(item: CommandCenterItem) {
    const submittedQuery = query.value.trim();
    rememberSelection(item);
    closeCommandCenter();

    if (!item.href) return;

    if (item.external) {
      if (import.meta.client) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (submittedQuery && import.meta.client) {
      sessionStorage.setItem(
        PAGE_HIGHLIGHT_STORAGE_KEY,
        JSON.stringify({ href: item.href, query: submittedQuery }),
      );
    }

    await navigateTo(item.href);
  }

  watch(query, (value) => {
    searchQuery.value = value;
  });

  watch(
    () => route.fullPath,
    () => {
      closeCommandCenter();
    },
  );

  return {
    open,
    query,
    groupedItems,
    searchPending,
    searchError,
    searchIsEmpty,
    openCommandCenter,
    closeCommandCenter,
    selectItem,
  };
}
