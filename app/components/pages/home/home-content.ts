import { computed } from "vue";
import { useI18n } from "#imports";

export type HomeBrandColor = "yellow" | "blue" | "mint" | "coral";

export interface HomeProofItem {
  name: string;
  category: string;
  logo: string;
}

export interface HomeProblemItem {
  title: string;
  description: string;
}

export interface HomeSolutionPrinciple {
  icon: string;
  title: string;
  description: string;
}

export interface HomeReferenceItem {
  name: string;
  tone: "blue" | "mint" | "coral";
  title: string;
  problem: string;
  work: string;
  result: string;
}

export interface HomeOffer {
  tone: "mint" | "yellow" | "coral" | "blue";
  title: string;
  subtitle: string;
  description: string;
  note?: string;
  includedLabel: string;
  bullets: string[];
  durationLabel?: string;
  duration?: string;
  cta: string;
}

export interface HomeAboutCard {
  icon: string;
  color: HomeBrandColor;
  title: string;
  description: string;
}

export interface HomeFaqItem {
  label: string;
  content: string;
}

interface HomeMessageLists {
  "proof.items": HomeProofItem[];
  "problem.items": HomeProblemItem[];
  "solution.principles": HomeSolutionPrinciple[];
  "references.items": HomeReferenceItem[];
  "offers.items": HomeOffer[];
  "about.cards": HomeAboutCard[];
  "faq.items": HomeFaqItem[];
}

export function useHomeMessageList<Key extends keyof HomeMessageLists>(key: Key) {
  const { tm } = useI18n();

  return computed(() => tm(`pages.home.${key}`) as HomeMessageLists[Key]);
}
