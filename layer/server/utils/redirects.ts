import type { H3Event } from "h3";
import { many } from "@lupinum/ginko-content/server";
import { useRuntimeConfig } from "#imports";
import { defaultLocale, isLocaleCode, localeCodes } from "../../i18n/locales";
import { buildRedirectMap, type RedirectSourceDocument } from "./redirects.utils";

async function queryRedirectDocuments(event: H3Event): Promise<RedirectSourceDocument[]> {
  const contentRuntime = useRuntimeConfig(event).public.content as
    | { collections?: Record<string, unknown> }
    | undefined;
  const collections = ["docs", ...(contentRuntime?.collections?.blog ? ["blog"] : [])];

  const results = await Promise.all(
    collections.flatMap((collection) =>
      localeCodes.map((locale) =>
        // fallback: false — an English page resolved into a German route would
        // otherwise register its redirectFrom entries twice.
        many(event, collection, { locale, fallback: false }),
      ),
    ),
  );
  return results.flat() as RedirectSourceDocument[];
}

let cachedMap: Promise<Map<string, string>> | undefined;

export function loadRedirectMap(event: H3Event): Promise<Map<string, string>> {
  const configuredPrimaryLocale = useRuntimeConfig(event).public.ginkoDocs?.primaryLocale;
  const primaryLocale =
    typeof configuredPrimaryLocale === "string" && isLocaleCode(configuredPrimaryLocale)
      ? configuredPrimaryLocale
      : defaultLocale;
  if (import.meta.dev) {
    return queryRedirectDocuments(event).then((documents) =>
      buildRedirectMap(documents, primaryLocale),
    );
  }
  cachedMap ??= queryRedirectDocuments(event)
    .then((documents) => buildRedirectMap(documents, primaryLocale))
    .catch((error) => {
      cachedMap = undefined;
      throw error;
    });
  return cachedMap;
}
