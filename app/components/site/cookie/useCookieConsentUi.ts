import { useState } from "#imports";

export function useCookieConsentUi() {
  const settingsOpen = useState<boolean>("cookie-settings-open", () => false);
  return {
    settingsOpen,
    openCookieSettings: () => {
      settingsOpen.value = true;
    },
  };
}
