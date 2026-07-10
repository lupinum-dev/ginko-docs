import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
  clearTrackingProvidersForTest,
  dispatchTrackingEvent,
  getTrackingProviderCountForTest,
  registerTrackingProvider,
} from "./dispatch";
import {
  allowedTrackingPropKeys,
  createTrackingEvent,
  inferTargetUrlType,
  sanitizeTrackingProps,
  trackingEventNames,
} from "./events";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

describe("tracking events", () => {
  it("defines the canonical business event dictionary", () => {
    expect(trackingEventNames).toEqual(
      expect.arrayContaining([
        "cta_click",
        "form_submit_success",
        "search_open",
        "search_result_click",
        "directions_click",
        "download_request",
        "outbound_link_click",
        "video_start",
        "video_progress",
        "language_switch",
        "cookie_preferences_save",
        "chat_open",
        "chat_fallback_contact_click",
        "campaign_view",
        "campaign_conversion",
      ]),
    );
  });

  it("keeps the allowed event property surface small", () => {
    expect(allowedTrackingPropKeys).toEqual([
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
    ]);
  });

  it("strips PII, raw search text, and unknown properties", () => {
    expect(
      sanitizeTrackingProps({
        content_slug: "kontakt",
        email: "kunde@example.at",
        label: "Termin buchen",
        message: "Bitte rufen Sie Max Mustermann unter +43 1 234 5678 an.",
        phone: "+43 1 234 5678",
        query: "matthias@example.at",
        raw_search: "Max Mustermann",
        search_text: "Beratung Wien",
        unknown: "keep me",
      }),
    ).toEqual({
      content_slug: "kontakt",
      label: "Termin buchen",
    });
  });

  it("rejects obvious PII even in allowed label fields", () => {
    expect(
      createTrackingEvent("cta_click", {
        label: "kunde@example.at",
        locale: "de",
        location: "hero",
      }),
    ).toEqual({
      name: "cta_click",
      props: {
        locale: "de",
        location: "hero",
      },
    });
  });

  it("normalizes event values and target URL types", () => {
    expect(
      createTrackingEvent("outbound_link_click", {
        label: "A".repeat(200),
        success: true,
        step: 2,
        target_url_type: inferTargetUrlType("https://example.at"),
      }),
    ).toEqual({
      name: "outbound_link_click",
      props: {
        label: "A".repeat(120),
        success: true,
        step: 2,
        target_url_type: "external",
      },
    });

    expect(inferTargetUrlType("mailto:office@example.at")).toBe("email");
    expect(inferTargetUrlType("tel:+4312345678")).toBe("phone");
    expect(inferTargetUrlType("#kontakt")).toBe("anchor");
    expect(inferTargetUrlType("/kontakt")).toBe("internal");
    expect(
      createTrackingEvent("directions_click", {
        label: "Route",
        target_url_type: "external",
      }),
    ).toMatchObject({
      name: "directions_click",
      props: {
        label: "Route",
        target_url_type: "external",
      },
    });
    expect(createTrackingEvent("download_request", { content_slug: "checklist" })).toMatchObject({
      name: "download_request",
      props: {
        content_slug: "checklist",
      },
    });
    expect(createTrackingEvent("video_start", { content_slug: "intro" })).toMatchObject({
      name: "video_start",
      props: {
        content_slug: "intro",
      },
    });
    expect(
      createTrackingEvent("video_progress", { content_slug: "intro", step: 50 }),
    ).toMatchObject({
      name: "video_progress",
      props: {
        content_slug: "intro",
        step: 50,
      },
    });
  });

  it("keeps components away from provider globals", () => {
    const files = [
      "app/components/site/SiteHeader.vue",
      "app/components/site/SiteFooter.vue",
      "app/components/marketing/HeroSection.vue",
      "app/components/marketing/ConsentEmbed.vue",
      "app/components/marketing/CtaSection.vue",
      "app/components/content/Feedback.vue",
      "app/composables/useTracking.ts",
      "app/lib/service-scripts.ts",
    ];

    for (const file of files) {
      expect(readAppFile(file)).not.toMatch(/window\.(plausible|gtag|fbq|dataLayer)|gtag\(/);
    }
  });

  it("dispatches sanitized events only through registered providers", () => {
    clearTrackingProvidersForTest();
    const received: unknown[] = [];
    const unregister = registerTrackingProvider((event) => received.push(event));
    const event = createTrackingEvent("search_submit", {
      locale: "de",
      query: "kunde@example.at",
    });

    expect(getTrackingProviderCountForTest()).toBe(1);
    dispatchTrackingEvent(event);
    unregister();
    dispatchTrackingEvent(createTrackingEvent("search_open"));

    expect(getTrackingProviderCountForTest()).toBe(0);
    expect(received).toEqual([
      {
        name: "search_submit",
        props: {
          locale: "de",
        },
      },
    ]);
  });

  it("wires existing business UI interactions to the tracking helpers", () => {
    const header = readAppFile("app/components/site/SiteHeader.vue");
    const localeSwitcher = readAppFile("app/components/site/SiteLocaleSwitcher.vue");
    const footer = readAppFile("app/components/site/SiteFooter.vue");
    const commandCenter = readAppFile("app/features/search/useCommandCenter.ts");
    const hero = readAppFile("app/components/marketing/HeroSection.vue");
    const businessCta = readAppFile("app/components/marketing/CtaSection.vue");
    const contactPage = readAppFile("app/pages/contact.vue");
    const faqSection = readAppFile("app/components/marketing/FaqSection.vue");
    const consentEmbed = readAppFile("app/components/marketing/ConsentEmbed.vue");
    const tracking = readAppFile("app/composables/useTracking.ts");

    expect(header).toContain("trackNavigation");
    expect(header).not.toContain("trackOutboundLink");
    expect(localeSwitcher).toContain("trackLanguageSwitch");
    expect(localeSwitcher).toContain("trackNavigation");
    expect(footer).toContain("trackContactLink");
    expect(footer).toContain("trackFooterNavigation");
    expect(commandCenter).toContain('trackSearch("search_open"');
    expect(commandCenter).toContain('trackSearch("search_submit"');
    expect(commandCenter).toContain("trackSearchResult");
    expect(commandCenter).toContain("trackOutboundLink");
    expect(hero).toContain("trackCta('business_hero'");
    expect(businessCta).toContain("trackCta('business_cta'");
    expect(contactPage).toContain("contact_page_email");
    expect(contactPage).toContain("contact_page_phone");
    expect(faqSection).toContain("trackFaq");
    expect(consentEmbed).toContain("hasConsent(props.category)");
    expect(consentEmbed).toContain("trackDirections");
    expect(consentEmbed).toContain("trackDownload");
    expect(consentEmbed).toContain('trackVideo("video_start"');
    expect(tracking).toContain('track("directions_click"');
    expect(tracking).toContain('track("download_request"');
    expect(tracking).toContain("function trackVideo");
    expect(tracking).toContain('track("faq_open"');
  });

  it("keeps the tracking debug output dev-only and provider-neutral", () => {
    const tracking = readAppFile("app/composables/useTracking.ts");

    expect(tracking).toContain("import.meta.dev");
    expect(tracking).toContain("import.meta.client");
    expect(tracking).toContain("console.groupCollapsed");
    expect(tracking).not.toMatch(/window\.(plausible|gtag|fbq|dataLayer)|gtag\(/);
  });
});
