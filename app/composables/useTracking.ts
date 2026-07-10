import { siteConfig } from "@/site.config";
import {
  createTrackingEvent,
  inferTargetUrlType,
  type TrackingEvent,
  type TrackingEventName,
  type TrackingProps,
} from "@/lib/tracking/events";
import { dispatchTrackingEvent } from "@/lib/tracking/dispatch";
import { computed } from "vue";
import { useI18n } from "#imports";

function hasEnabledAnalytics() {
  return siteConfig.analytics.plausible.enabled || siteConfig.analytics.ga4.enabled;
}

function logDevTrackingEvent(event: TrackingEvent, enabled: boolean) {
  if (!import.meta.dev || !import.meta.client) return;
  const status = enabled ? "ready" : "disabled";

  if (typeof console.groupCollapsed === "function") {
    console.groupCollapsed(`[tracking:${status}] ${event.name}`);
    console.debug(event.props);
    console.groupEnd();
    return;
  }

  console.debug("[tracking]", status, event.name, event.props);
}

export function useTracking() {
  const { locale } = useI18n();
  const analyticsEnabled = computed(() => hasEnabledAnalytics());

  function track(name: TrackingEventName, props: Record<string, unknown> = {}) {
    const event = createTrackingEvent(name, {
      ...props,
      locale: locale.value,
    });

    logDevTrackingEvent(event, analyticsEnabled.value);
    dispatchTrackingEvent(event);
    return event;
  }

  function trackCta(location: string, label: string, href: string, variant?: string) {
    return track("cta_click", {
      location,
      label,
      variant,
      target_url_type: inferTargetUrlType(href),
    });
  }

  function trackNavigation(location: string, label: string, href: string) {
    return track(location === "footer" ? "footer_link_click" : "navigation_click", {
      location,
      label,
      target_url_type: inferTargetUrlType(href),
    });
  }

  function trackContactLink(location: string, href: string) {
    return track("contact_link_click", {
      location,
      target_url_type: inferTargetUrlType(href),
    });
  }

  function trackForm(
    name: "form_start" | "form_submit_error" | "form_submit_success",
    formKey: string,
  ) {
    return track(name, {
      form_key: formKey,
    });
  }

  function trackSearch(name: "search_open" | "search_submit", location: string) {
    return track(name, {
      location,
    });
  }

  function trackSearchResult(contentType: string, contentSlug: string) {
    return track("search_result_click", {
      content_type: contentType,
      content_slug: contentSlug,
    });
  }

  function trackFaq(label: string) {
    return track("faq_open", {
      label,
    });
  }

  function trackDirections(href: string, label?: string) {
    return track("directions_click", {
      label,
      target_url_type: inferTargetUrlType(href),
    });
  }

  function trackDownload(contentSlug: string, label?: string) {
    return track("download_request", {
      content_slug: contentSlug,
      label,
    });
  }

  function trackVideo(name: "video_progress" | "video_start", contentSlug: string, step?: number) {
    return track(name, {
      content_slug: contentSlug,
      step,
    });
  }

  function trackOutboundLink(location: string, href: string, label?: string) {
    return track("outbound_link_click", {
      location,
      label,
      target_url_type: inferTargetUrlType(href),
    });
  }

  function trackLanguageSwitch(label: string) {
    return track("language_switch", {
      label,
    });
  }

  function trackCookiePreferences(success: boolean) {
    return track("cookie_preferences_save", {
      success,
    });
  }

  function trackChat(
    name:
      | "chat_close"
      | "chat_conversation_start"
      | "chat_fallback_contact_click"
      | "chat_lead_handoff"
      | "chat_open",
    props: Record<string, unknown> = {},
  ) {
    return track(name, props);
  }

  function trackCampaign(
    name:
      | "campaign_conversion"
      | "campaign_dismiss"
      | "campaign_explore_site"
      | "campaign_primary_cta"
      | "campaign_return"
      | "campaign_view",
    campaignKey: string,
    offerKey: string,
    location?: string,
  ) {
    return track(name, {
      campaign_key: campaignKey,
      offer_key: offerKey,
      location,
    });
  }

  return {
    analyticsEnabled,
    track,
    trackChat,
    trackCampaign,
    trackContactLink,
    trackCookiePreferences,
    trackCta,
    trackDirections,
    trackDownload,
    trackFaq,
    trackForm,
    trackLanguageSwitch,
    trackNavigation,
    trackOutboundLink,
    trackSearch,
    trackSearchResult,
    trackVideo,
  };
}

export type { TrackingEventName, TrackingProps };
