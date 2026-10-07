import { useNuxtApp } from "#imports";
import { globalMessages } from "../../i18n/messages/global";

type Params = Record<string, string | number>;
type Translate = (key: string, params?: Params) => string;

function englishMessage(key: string): string | undefined {
  let node: unknown = globalMessages;
  for (const part of key.split(".")) {
    if (!node || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  const leaf = node as { en?: unknown } | undefined;
  return typeof leaf?.en === "string" ? leaf.en : undefined;
}

function interpolate(message: string, params?: Params): string {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Layer UI strings for components that also ship in the component kit. Sites
 * without @nuxtjs/i18n have no `useI18n`, so the kit falls back to English.
 */
export function useDocsText(): { t: Translate } {
  // $i18n exists only when the host installs @nuxtjs/i18n; the layer always does.
  const i18n = (useNuxtApp() as { $i18n?: { t: Translate } }).$i18n;
  if (i18n) return { t: (key, params) => i18n.t(key, params ?? {}) };
  return { t: (key, params) => interpolate(englishMessage(key) ?? key, params) };
}
