import { getLocalizedSiteText } from "#ginko-docs/config/site.utils";
import { useI18n, useRouter } from "#imports";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { computed } from "vue";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
}

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
  }));

  const banner = computed(() => {
    const linkHref = path("blog");

    return {
      show: router.resolve(linkHref).matched.length > 0,
      text: t("banner.text"),
      linkLabel: t("banner.linkLabel"),
      linkHref,
    };
  });

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

  const mainNav = computed<NavItem[]>(() => []);

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
