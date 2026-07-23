import { type LocaleCode, localeCodes } from "../locales";
import { localizedRoutes } from "../routes";
import { globalMessages } from "./global";
import { localizeMessages } from "./localize";

export const messages = localeCodes.reduce(
  (localizedMessages, locale) => {
    localizedMessages[locale] = {
      ...localizeMessages(globalMessages, locale),
      routes: localizedRoutes[locale],
    };
    return localizedMessages;
  },
  {} as Record<
    LocaleCode,
    ReturnType<typeof localizeMessages<typeof globalMessages>> & {
      routes: (typeof localizedRoutes)[LocaleCode];
    }
  >,
);
