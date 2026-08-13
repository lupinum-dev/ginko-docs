import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";
import { useI18n, useRouter } from "#imports";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { computed } from "vue";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";
import {
  resolveBanner,
  resolveMainNav,
  resolveSocialLinks,
  type NavItem,
} from "./site-navigation.utils";

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
    legalLinks: config.site.legalLinks.map((link) => {
      const href = getLocalizedSiteText(link.to, locale.value);
      return {
        label: getLocalizedSiteText(link.label, locale.value),
        href,
        external: /^https?:\/\//.test(href),
      };
    }),
  }));

  const blogPath = computed(() => path("blog"));
  const blogExists = computed(() =>
    router.getRoutes().some((route) => route.path === blogPath.value),
  );

  const banner = computed(() =>
    resolveBanner(config.banner, {
      locale: locale.value,
      defaultText: t("banner.text"),
      defaultLinkLabel: t("banner.linkLabel"),
    }),
  );

  const socialLinks = computed<NavItem[]>(() => resolveSocialLinks(config.social));

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

  return { site, banner, mainNav, socialLinks };
};
