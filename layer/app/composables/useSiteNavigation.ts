import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";
import { useI18n, useRouter } from "#imports";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { computed } from "vue";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";
import { resolveBanner, resolveMainNav, type NavItem } from "./site-navigation.utils";

export interface SidebarSection {
  title: string;
  items: { label: string; href: string; badge?: string }[];
}

export const useSiteNavigation = () => {
  const config = useGinkoDocsConfig();
  const { locale, t } = useI18n();
  const router = useRouter();
  const path = useLocalizedPath();

  const site = computed(() => ({
    name: getLocalizedSiteText(config.site.name, locale.value),
    description: getLocalizedSiteText(config.site.description, locale.value),
    logo: config.site.logo,
    url: config.site.url,
    lupinumAttribution: config.site.lupinumAttribution,
  }));

  const blogPath = computed(() => path("blog"));
  const blogExists = computed(() =>
    router.getRoutes().some((route) => route.path === blogPath.value),
  );

  const banner = computed(() =>
    resolveBanner(config.banner, {
      locale: locale.value,
      blogPath: blogPath.value,
      blogExists: blogExists.value,
      defaultText: t("banner.text"),
      defaultLinkLabel: t("banner.linkLabel"),
    }),
  );

  const socialLinks = computed<NavItem[]>(
    () =>
      [
        config.social.github
          ? {
              label: t("nav.github"),
              href: config.social.github,
              external: true,
              icon: "lucide:github",
            }
          : null,
        config.social.linkedin
          ? {
              label: "LinkedIn",
              href: config.social.linkedin,
              external: true,
              icon: "lucide:linkedin",
            }
          : null,
      ].filter(Boolean) as NavItem[],
  );

  const mainNav = computed<NavItem[]>(() =>
    resolveMainNav(config.nav.links, {
      locale: locale.value,
      docsPath: path("docs"),
      blogPath: blogPath.value,
      blogExists: blogExists.value,
      docsLabel: t("nav.documentation"),
      blogLabel: t("nav.blog"),
      docsDescription: t("nav.docsDescription"),
      blogDescription: t("nav.blogDescription"),
    }),
  );

  const footerNav = computed<{
    product: NavItem[];
    resources: NavItem[];
    company: NavItem[];
  }>(() => ({
    product: [],
    resources: [...socialLinks.value],
    company: [],
  }));

  return { site, banner, mainNav, footerNav, socialLinks };
};
