import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { siteConfig } from "../site.config";
import { validateSiteConfig } from "../config/site.schema";
import { createTrackingEvent } from "./tracking/events";

const appRoot = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(appRoot, path), "utf8");
}

describe("chat foundation", () => {
  it("keeps chat disabled by default with localized fallback copy", () => {
    expect(validateSiteConfig(siteConfig).chat).toMatchObject({
      enabled: false,
      provider: "none",
      consentCategory: "support",
      fallbackMethod: "contact-page",
    });
    expect(siteConfig.chat.availability).toMatchObject({
      de: expect.any(String),
      en: expect.any(String),
    });
    expect(siteConfig.chat.fallbackLabel).toMatchObject({
      de: expect.any(String),
      en: expect.any(String),
    });
  });

  it("mounts a launcher that renders nothing while chat is disabled", () => {
    const interactionLayer = readAppFile("app/components/site/SiteInteractionLayer.vue");
    const campaignLayout = readAppFile("app/layouts/campaign.vue");
    const launcher = readAppFile("app/features/chat/components/ChatLauncher.vue");
    const useChat = readAppFile("app/features/chat/useChat.ts");

    expect(interactionLayer).toContain("<ChatLauncher");
    expect(campaignLayout).not.toContain("SiteInteractionLayer");
    expect(campaignLayout).not.toContain("ChatLauncher");
    expect(launcher).toContain('v-if="isEnabled"');
    expect(useChat).toContain('config.chat.enabled && config.chat.provider !== "none"');
  });

  it("gates provider loading on consent and keeps fallback contact provider-neutral", () => {
    const launcher = readAppFile("app/features/chat/components/ChatLauncher.vue");
    const gate = readAppFile("app/features/chat/components/ChatConsentGate.vue");
    const useChat = readAppFile("app/features/chat/useChat.ts");

    for (const source of [launcher, gate, useChat]) {
      expect(source).not.toMatch(
        /createElement\(["']script|appendChild|window\.(Brevo|crisp|HubSpot)/,
      );
    }

    expect(launcher).toContain("<ChatConsentGate");
    expect(launcher).toContain("needsConsent");
    expect(gate).toContain(':href="fallbackHref"');
    expect(useChat).toContain("hasConsent(config.chat.consentCategory)");
    expect(useChat).toContain('localizedPath("contact")');
    expect(useChat).toContain("fallbackEmail");
  });

  it("tracks chat interactions without message text or contact details", () => {
    const useChat = readAppFile("app/features/chat/useChat.ts");

    expect(useChat).toContain('trackChat("chat_conversation_start"');
    expect(useChat).toContain('trackChat("chat_lead_handoff"');
    expect(useChat).toContain("if (!canLoadProvider.value) return;");
    expect(
      createTrackingEvent("chat_fallback_contact_click", {
        email: "kunde@example.at",
        label: "kunde@example.at",
        location: "chat_launcher",
        message: "Bitte Max Mustermann unter +43 1 234 5678 anrufen.",
        target_url_type: "internal",
      }),
    ).toEqual({
      name: "chat_fallback_contact_click",
      props: {
        location: "chat_launcher",
        target_url_type: "internal",
      },
    });
    expect(
      createTrackingEvent("chat_conversation_start", {
        email: "kunde@example.at",
        label: "Gespraech gestartet",
        location: "chat_provider",
        message: "Bitte Max Mustermann unter +43 1 234 5678 anrufen.",
      }),
    ).toEqual({
      name: "chat_conversation_start",
      props: {
        label: "Gespraech gestartet",
        location: "chat_provider",
      },
    });
    expect(
      createTrackingEvent("chat_lead_handoff", {
        form_key: "chat",
        location: "chat_provider",
        name: "Max Mustermann",
        phone: "+43 1 234 5678",
      }),
    ).toEqual({
      name: "chat_lead_handoff",
      props: {
        form_key: "chat",
        location: "chat_provider",
      },
    });
  });
});
