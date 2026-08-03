import { createError, defineEventHandler, getRouterParam } from "h3";
import { defaultLocale, isLocaleCode } from "../../../../i18n/locales";
import { serveBlogFeed } from "../../../utils/blog-feed";

// A param route keeps the router free of static locale segments; a static
// /de/... node would shadow ginko-content's /:locale/llms.txt routes.
export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, "locale");
  if (!locale || !isLocaleCode(locale) || locale === defaultLocale) {
    throw createError({ statusCode: 404, statusMessage: "Page not found" });
  }
  return serveBlogFeed(event, locale);
});
