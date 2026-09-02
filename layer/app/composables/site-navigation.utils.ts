import type {
  GinkoDocsAppConfig,
  GinkoDocsLink,
  GinkoDocsSocialPlatform,
} from "../../shared/types/app-config";
import { getLocalizedSiteText } from "../config/site.utils";

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
  description?: string;
  /** Set on social links so features can find a platform without matching its icon. */
  platform?: GinkoDocsSocialPlatform;
}

export interface MainNavContext {
  locale: string;
  docsPath: string;
  blogPath: string;
  blogExists: boolean;
  docsLabel: string;
  blogLabel: string;
  docsDescription?: string;
  blogDescription?: string;
}

const isExternalHref = (href: string) => /^https?:\/\//.test(href);

export function resolveMainNav(
  links: GinkoDocsAppConfig["nav"]["links"],
  ctx: MainNavContext,
): NavItem[] {
  if (Array.isArray(links)) {
    return links.map((link: GinkoDocsLink) => {
      const href = getLocalizedSiteText(link.to, ctx.locale);
      return {
        label: getLocalizedSiteText(link.label, ctx.locale),
        href,
        external: isExternalHref(href),
        icon: link.icon,
        description: link.description
          ? getLocalizedSiteText(link.description, ctx.locale)
          : undefined,
      };
    });
  }

  const items: NavItem[] = [
    {
      label: ctx.docsLabel,
      href: ctx.docsPath,
      icon: "lucide:book-open",
      description: ctx.docsDescription,
    },
  ];
  if (ctx.blogExists) {
    items.push({
      label: ctx.blogLabel,
      href: ctx.blogPath,
      icon: "lucide:file-text",
      description: ctx.blogDescription,
    });
  }
  return items;
}

/** Brand names are not translated, so the labels are literals. */
const socialDefaults: Record<GinkoDocsSocialPlatform, { label: string; icon: string }> = {
  github: { label: "GitHub", icon: "ginko-social:github" },
  discord: { label: "Discord", icon: "ginko-social:discord" },
  linkedin: { label: "LinkedIn", icon: "lucide:linkedin" },
};

export function resolveSocialLinks(social: GinkoDocsAppConfig["social"]): NavItem[] {
  // Config order is render order, so a site can list Discord ahead of GitHub.
  return Object.entries(social).flatMap<NavItem>(([key, entry]) => {
    const platform = key as GinkoDocsSocialPlatform;
    const defaults = socialDefaults[platform];
    if (!defaults || !entry) return [];

    const link = typeof entry === "string" ? { href: entry } : entry;
    if (!link.href) return [];

    return [
      {
        label: link.label ?? defaults.label,
        href: link.href,
        external: true,
        icon: link.icon ?? defaults.icon,
        platform,
      },
    ];
  });
}

export interface BannerContext {
  locale: string;
  defaultText: string;
  defaultLinkLabel: string;
}

export interface ResolvedBanner {
  show: boolean;
  text: string;
  linkLabel: string;
  linkHref?: string;
  storageKey: string;
}

export function bannerStorageKey(id: string) {
  return `ginko-docs:banner:${id}`;
}

export function resolveBanner(
  config: GinkoDocsAppConfig["banner"],
  ctx: BannerContext,
): ResolvedBanner {
  const text = config.text ? getLocalizedSiteText(config.text, ctx.locale) : ctx.defaultText;
  const linkHref = config.link?.to ? getLocalizedSiteText(config.link.to, ctx.locale) : undefined;
  const linkLabel = config.link?.label
    ? getLocalizedSiteText(config.link.label, ctx.locale)
    : ctx.defaultLinkLabel;

  return {
    show: config.enabled,
    text,
    linkLabel,
    linkHref,
    storageKey: bannerStorageKey(config.id),
  };
}
