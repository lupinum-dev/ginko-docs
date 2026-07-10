export const trackingEventNames = [
  "cta_click",
  "navigation_click",
  "footer_link_click",
  "contact_link_click",
  "form_start",
  "form_submit_success",
  "form_submit_error",
  "search_open",
  "search_submit",
  "search_result_click",
  "faq_open",
  "directions_click",
  "download_request",
  "outbound_link_click",
  "video_start",
  "video_progress",
  "language_switch",
  "cookie_preferences_save",
  "chat_open",
  "chat_conversation_start",
  "chat_lead_handoff",
  "chat_fallback_contact_click",
  "chat_close",
  "campaign_view",
  "campaign_primary_cta",
  "campaign_explore_site",
  "campaign_return",
  "campaign_dismiss",
  "campaign_conversion",
] as const;

export type TrackingEventName = (typeof trackingEventNames)[number];
export type TrackingPropValue = boolean | number | string;
export type TrackingProps = Partial<Record<TrackingPropKey, TrackingPropValue>>;

export const allowedTrackingPropKeys = [
  "event_id",
  "locale",
  "location",
  "label",
  "variant",
  "form_key",
  "content_type",
  "content_slug",
  "target_url_type",
  "step",
  "success",
  "campaign_key",
  "offer_key",
] as const;

export type TrackingPropKey = (typeof allowedTrackingPropKeys)[number];

export interface TrackingEvent {
  name: TrackingEventName;
  props: TrackingProps;
}

const allowedPropKeySet = new Set<string>(allowedTrackingPropKeys);
const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const phonePattern = /(?:\+|00)?[\d\s().-]{7,}\d/;
const blockedKeyPattern =
  /(^|_)(email|e_mail|phone|tel|telephone|name|first_name|last_name|message|payload|query|search_text|raw)(_|$)/;

function containsPotentialPii(value: TrackingPropValue) {
  if (typeof value !== "string") return false;
  return emailPattern.test(value) || phonePattern.test(value);
}

function normalizePropValue(value: unknown): TrackingPropValue | undefined {
  if (typeof value === "string") return value.slice(0, 120);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value;
  return undefined;
}

export function sanitizeTrackingProps(input: Record<string, unknown> = {}): TrackingProps {
  const props: TrackingProps = {};

  for (const [key, rawValue] of Object.entries(input)) {
    if (!allowedPropKeySet.has(key) || blockedKeyPattern.test(key)) continue;

    const value = normalizePropValue(rawValue);
    if (value === undefined || containsPotentialPii(value)) continue;

    props[key as TrackingPropKey] = value;
  }

  return props;
}

export function createTrackingEvent(
  name: TrackingEventName,
  props: Record<string, unknown> = {},
): TrackingEvent {
  return {
    name,
    props: sanitizeTrackingProps(props),
  };
}

export function inferTargetUrlType(href: string): TrackingProps["target_url_type"] {
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "phone";
  if (/^https?:\/\//i.test(href)) return "external";
  if (href.startsWith("#")) return "anchor";
  return "internal";
}
