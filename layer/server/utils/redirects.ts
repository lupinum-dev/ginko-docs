import type { H3Event } from "h3";
import { many } from "@lupinum/ginko-content/server";
import { useRuntimeConfig } from "#imports";
import { localeCodes } from "../../i18n/locales";
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
  if (import.meta.dev) {
    return queryRedirectDocuments(event).then(buildRedirectMap);
  }
  cachedMap ??= queryRedirectDocuments(event)
    .then(buildRedirectMap)
    .catch((error) => {
      cachedMap = undefined;
      throw error;
    });
  return cachedMap;
}
