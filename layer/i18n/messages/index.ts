import { type LocaleCode, localeCodes } from "../locales";
import { localizedRoutes } from "../routes";
import { localizeMessages } from "./localize";
import { messageSource } from "./source";

export const messages = localeCodes.reduce(
  (localizedMessages, locale) => {
    localizedMessages[locale] = {
      ...localizeMessages(messageSource, locale),
      routes: localizedRoutes[locale],
    };
    return localizedMessages;
  },
  {} as Record<LocaleCode, any>,
);
