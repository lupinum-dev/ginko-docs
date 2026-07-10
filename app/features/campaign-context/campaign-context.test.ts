import { describe, expect, test } from "vite-plus/test";
import {
  createCampaignContext,
  isCampaignKey,
  parseCampaignContext,
  readCampaignContext,
} from "./campaign-context";

describe("campaign context", () => {
  test("creates only the registered, non-personal campaign payload", () => {
    expect(createCampaignContext("website-clarity", "de", 100)).toEqual({
      campaignKey: "website-clarity",
      offerKey: "website-clarity-conversation",
      landingPath: "/website-klarheitsgespraech",
      returnLabelKey: "pages.campaign.returnBar.label",
      startedAt: 100,
    });
  });

  test("accepts only allowlisted handoff keys", () => {
    expect(isCampaignKey("website-clarity")).toBe(true);
    expect(isCampaignKey("../../arbitrary-campaign")).toBe(false);
  });

  test("rejects tampered, expired, future, and malformed stored values", () => {
    const current = createCampaignContext("website-clarity", "en", 1_000);
    expect(parseCampaignContext(current, 2_000)).toEqual(current);
    expect(parseCampaignContext({ ...current, offerKey: "other" }, 2_000)).toBeNull();
    expect(
      parseCampaignContext({ ...current, landingPath: "https://example.com" }, 2_000),
    ).toBeNull();
    expect(parseCampaignContext(current, 1_000 + 12 * 60 * 60 * 1000 + 1)).toBeNull();
    expect(parseCampaignContext({ ...current, startedAt: 3_000 }, 2_000)).toBeNull();
    expect(readCampaignContext("not-json", 2_000)).toBeNull();
  });
});
