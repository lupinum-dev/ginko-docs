import type { H3Event } from "h3";
import { createError, setHeader } from "h3";
import { many } from "@lupinum/ginko-content/server";
import { useAppConfig, useRuntimeConfig } from "#imports";
import { blog } from "../../i18n/messages/global/blog";
import {
  defaultLocale,
  isLocaleCode,
  locales,
  localizedPath,
  type LocaleCode,
} from "../../i18n/locales";
import { routeSlugs } from "../../shared/route-slugs";
import { getLocalizedSiteText } from "../../app/config/site.utils";
import { createGinkoDocsCollections } from "../../content-collections";
import { buildRssFeed } from "./feed";

export const MAX_FEED_POSTS = 50;
const { blog: blogCollection, authors: authorsCollection } = createGinkoDocsCollections([
  "en",
  "de",
]);

export function blogFeedPath(
  locale: LocaleCode,
  primaryLocale: LocaleCode = defaultLocale,
): string {
  return `${localizedPath(locale, routeSlugs.blog[locale], primaryLocale)}/rss.xml`;
}

export async function serveBlogFeed(event: H3Event, locale: LocaleCode) {
  const publicRuntime = useRuntimeConfig(event).public;
  const contentRuntime = publicRuntime.content as
    | { collections?: Record<string, unknown> }
    | undefined;
  if (!contentRuntime?.collections?.blog) {
    throw createError({ statusCode: 404, statusMessage: "Blog is not enabled" });
  }

  const site = useAppConfig().ginkoDocs.site;
  const configuredPrimaryLocale = publicRuntime.ginkoDocs?.primaryLocale;
  const primaryLocale =
    typeof configuredPrimaryLocale === "string" && isLocaleCode(configuredPrimaryLocale)
      ? configuredPrimaryLocale
      : defaultLocale;
  const posts = await many(event, blogCollection, {
    locale,
    fallback: true,
    populate: { author: authorsCollection },
    sort: { date: "desc" },
    limit: MAX_FEED_POSTS,
  });

  setHeader(event, "content-type", "application/rss+xml; charset=utf-8");
  return buildRssFeed({
    title: `${blog.title[locale]} - ${getLocalizedSiteText(site.name, locale)}`,
    description: blog.description[locale],
    siteUrl: site.url,
    feedPath: blogFeedPath(locale, primaryLocale),
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
