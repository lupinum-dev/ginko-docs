import { home } from "../../../app/components/pages/home/home.messages";
import { contact } from "./contact";
import { services } from "./services";
import { references } from "./references";
import { thankYou } from "./thank-you";
import { about } from "../../../app/components/pages/about/about.messages";
import { campaign } from "../../../app/components/pages/campaigns/website-clarity/campaign.messages";

export const pageMessages = {
  home,
  contact,
  services,
  references,
  thankYou,
  about,
  campaign,
} as const;
