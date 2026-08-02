import type { H3Event } from "h3";
import { createError, setHeader } from "h3";
import { many } from "@lupinum/ginko-content/server";
import { useAppConfig, useRuntimeConfig } from "#imports";
import { blog } from "../../i18n/messages/global/blog";
import { locales, localizedPath, type LocaleCode } from "../../i18n/locales";
import { routeSlugs } from "../../shared/route-slugs";
import { getLocalizedSiteText } from "../../app/config/site.utils";
import { buildRssFeed } from "./feed";

export const MAX_FEED_POSTS = 50;

export function blogFeedPath(locale: LocaleCode): string {
  return `${localizedPath(locale, routeSlugs.blog[locale])}/rss.xml`;
}

export async function serveBlogFeed(event: H3Event, locale: LocaleCode) {
  const contentRuntime = useRuntimeConfig(event).public.content as
    | { collections?: Record<string, unknown> }
    | undefined;
  if (!contentRuntime?.collections?.blog) {
    throw createError({ statusCode: 404, statusMessage: "Blog is not enabled" });
  }

  const site = useAppConfig(event).ginkoDocs.site;
  const posts = await many(event, "blog", {
    locale,
    fallback: true,
    populate: { author: "authors" },
    sort: { date: "desc" },
    limit: MAX_FEED_POSTS,
  });

  setHeader(event, "content-type", "application/rss+xml; charset=utf-8");
  return buildRssFeed({
    title: `${blog.title[locale]} - ${getLocalizedSiteText(site.name, locale)}`,
    description: blog.description[locale],
    siteUrl: site.url,
    feedPath: blogFeedPath(locale),
    language: locales.find((entry) => entry.code === locale)?.language ?? locale,
    items: posts.map((post) => ({
      title: post.title,
      path: post.route.resolvedPath,
      description: post.description,
      date: post.date,
      authorName: post.author?.name,
    })),
  });
}
