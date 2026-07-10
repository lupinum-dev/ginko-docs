import { localizedPath, type LocaleCode } from "../../../i18n/locales";
import { localizedRoutes } from "../../../i18n/routes";

export const campaignKeys = ["website-clarity"] as const;
export type CampaignKey = (typeof campaignKeys)[number];

export type CampaignContext = {
  campaignKey: CampaignKey;
  offerKey: "website-clarity-conversation";
  landingPath: string;
  returnLabelKey: "pages.campaign.returnBar.label";
  startedAt: number;
};

export type CampaignDefinition = {
  campaignKey: CampaignKey;
  offerKey: CampaignContext["offerKey"];
  landingPaths: Record<LocaleCode, string>;
  returnLabelKey: CampaignContext["returnLabelKey"];
};

const CAMPAIGN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export const campaigns = {
  "website-clarity": {
    campaignKey: "website-clarity",
    offerKey: "website-clarity-conversation",
    landingPaths: {
      de: localizedPath("de", localizedRoutes.de.websiteClarity),
      en: localizedPath("en", localizedRoutes.en.websiteClarity),
    },
    returnLabelKey: "pages.campaign.returnBar.label",
  },
} as const satisfies Record<CampaignKey, CampaignDefinition>;

export function isCampaignKey(value: unknown): value is CampaignKey {
  return typeof value === "string" && campaignKeys.includes(value as CampaignKey);
}

export function createCampaignContext(
  campaignKey: CampaignKey,
  locale: LocaleCode,
  startedAt = Date.now(),
): CampaignContext {
  const campaign = campaigns[campaignKey];
  return {
    campaignKey,
    offerKey: campaign.offerKey,
    landingPath: campaign.landingPaths[locale],
    returnLabelKey: campaign.returnLabelKey,
    startedAt,
  };
}

export function parseCampaignContext(value: unknown, now = Date.now()): CampaignContext | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<CampaignContext>;
  if (!isCampaignKey(candidate.campaignKey)) return null;

  const campaign = campaigns[candidate.campaignKey];
  const validLandingPath = Object.values(campaign.landingPaths).includes(
    candidate.landingPath as (typeof campaign.landingPaths)[LocaleCode],
  );
  if (
    candidate.offerKey !== campaign.offerKey ||
    candidate.returnLabelKey !== campaign.returnLabelKey ||
    !validLandingPath ||
    typeof candidate.startedAt !== "number" ||
    candidate.startedAt > now ||
    now - candidate.startedAt > CAMPAIGN_MAX_AGE_MS
  ) {
    return null;
  }

  return candidate as CampaignContext;
}

export function readCampaignContext(rawValue: string | null, now = Date.now()) {
  if (!rawValue) return null;
  try {
    return parseCampaignContext(JSON.parse(rawValue), now);
  } catch {
    return null;
  }
}
