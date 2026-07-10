import { siteConfig } from "@/site.config";
import type { SiteConfig } from "@/config/site.schema";
import { getLocalizedSiteText } from "@/config/site.utils";
import { inferTargetUrlType } from "@/lib/tracking/events";
import { computed } from "vue";
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useCookieConsent } from "@/composables/useCookieConsent";
import { useTracking } from "@/composables/useTracking";

export type ChatOpenResult = "disabled" | "needs-consent" | "open";

export function useChat(config: SiteConfig = siteConfig) {
  const { locale } = useI18n();
  const localizedPath = useLocalizedPath();
  const { hasConsent } = useCookieConsent();
  const { trackChat } = useTracking();

  const isEnabled = computed(() => config.chat.enabled && config.chat.provider !== "none");
  const needsConsent = computed(
    () =>
      isEnabled.value &&
      config.chat.consentCategory !== "essential" &&
      !hasConsent(config.chat.consentCategory),
  );
  const canLoadProvider = computed(() => isEnabled.value && !needsConsent.value);
  const availabilityText = computed(() =>
    getLocalizedSiteText(config.chat.availability, locale.value),
  );
  const fallbackLabel = computed(() =>
    getLocalizedSiteText(config.chat.fallbackLabel, locale.value),
  );
  const fallbackHref = computed(() =>
    config.chat.fallbackMethod === "contact-page"
      ? localizedPath("contact")
      : `mailto:${config.chat.fallbackEmail}`,
  );

  function openChat(): ChatOpenResult {
    if (!isEnabled.value) return "disabled";
    if (needsConsent.value) return "needs-consent";

    trackChat("chat_open", {
      location: "chat_launcher",
    });
    return "open";
  }

  function closeChat() {
    if (!isEnabled.value) return;
    trackChat("chat_close", {
      location: "chat_launcher",
    });
  }

  function trackConversationStart() {
    if (!canLoadProvider.value) return;
    trackChat("chat_conversation_start", {
      location: "chat_provider",
    });
  }

  function trackLeadHandoff() {
    if (!canLoadProvider.value) return;
    trackChat("chat_lead_handoff", {
      location: "chat_provider",
    });
  }

  function trackFallbackContact(location = "chat_launcher") {
    trackChat("chat_fallback_contact_click", {
      location,
      target_url_type: inferTargetUrlType(fallbackHref.value),
    });
  }

  return {
    availabilityText,
    canLoadProvider,
    closeChat,
    fallbackHref,
    fallbackLabel,
    isEnabled,
    needsConsent,
    openChat,
    provider: config.chat.provider,
    trackConversationStart,
    trackFallbackContact,
    trackLeadHandoff,
  };
}
