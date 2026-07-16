import { defaultLocale } from "./locales";
import { messages } from "./messages/index";
import { defineI18nConfig } from "#imports";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages,
}));
