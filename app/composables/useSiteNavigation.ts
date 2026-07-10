import { siteConfig } from "@/site.config";
import { getLocalizedSiteText } from "@/config/site.utils";
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { computed } from "vue";

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
  const { locale, t } = useI18n();
  const path = useLocalizedPath();

  const site = computed(() => ({
    name: getLocalizedSiteText(siteConfig.site.name, locale.value),
    description: getLocalizedSiteText(siteConfig.site.description, locale.value),
    logo: siteConfig.site.logo,
    url: siteConfig.site.url,
    brandName: siteConfig.identity.brandName,
  }));

  const banner = computed(() => ({
    show: true,
    text: t("banner.text"),
    linkLabel: t("banner.linkLabel"),
    linkHref: path("blog"),
  }));

  const socialLinks = computed<NavItem[]>(
    () =>
      [
        siteConfig.social.github
          ? {
              label: t("nav.github"),
              href: siteConfig.social.github,
              external: true,
              icon: "lucide:github",
            }
          : null,
        siteConfig.social.linkedin
          ? {
              label: "LinkedIn",
              href: siteConfig.social.linkedin,
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
    company: [
      { label: t("nav.privacy"), href: path("privacy") },
      { label: t("nav.terms"), href: path("terms") },
      { label: t("nav.imprint"), href: path("imprint") },
    ],
  }));

  const contact = siteConfig.contact;

  return { site, banner, mainNav, footerNav, socialLinks, contact };
};
