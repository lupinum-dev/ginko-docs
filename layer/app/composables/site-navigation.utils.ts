import type { GinkoDocsAppConfig, GinkoDocsLink } from "../../shared/types/app-config";
import { getLocalizedSiteText } from "../config/site.utils";

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
}

export interface MainNavContext {
  locale: string;
  docsPath: string;
  blogPath: string;
  blogExists: boolean;
  docsLabel: string;
  blogLabel: string;
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
      };
    });
  }

  const items: NavItem[] = [{ label: ctx.docsLabel, href: ctx.docsPath, icon: "lucide:book-open" }];
  if (ctx.blogExists) {
    items.push({ label: ctx.blogLabel, href: ctx.blogPath, icon: "lucide:file-text" });
  }
  return items;
}

export interface BannerContext {
  locale: string;
  blogPath: string;
  blogExists: boolean;
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
  const show = config.enabled === "auto" ? ctx.blogExists : config.enabled;
  const text = config.text ? getLocalizedSiteText(config.text, ctx.locale) : ctx.defaultText;
  const linkHref = config.link?.to
    ? getLocalizedSiteText(config.link.to, ctx.locale)
    : ctx.blogExists
      ? ctx.blogPath
      : undefined;
  const linkLabel = config.link?.label
    ? getLocalizedSiteText(config.link.label, ctx.locale)
    : ctx.defaultLinkLabel;

  return { show, text, linkLabel, linkHref, storageKey: bannerStorageKey(config.id) };
}
