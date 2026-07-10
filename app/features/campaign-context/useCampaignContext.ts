import { computed, onMounted, watch } from "vue";
import { useI18n, useRoute, useRouter, useState } from "#imports";
import {
  createCampaignContext,
  isCampaignKey,
  parseCampaignContext,
  readCampaignContext,
  type CampaignKey,
} from "./campaign-context";

const STORAGE_KEY = "lupinum-active-campaign";

export function useCampaignContext() {
  const route = useRoute();
  const router = useRouter();
  const { locale } = useI18n();
  const context = useState("active-campaign", () => {
    const handoff = Array.isArray(route.query.from) ? route.query.from[0] : route.query.from;
    return isCampaignKey(handoff) ? createCampaignContext(handoff, locale.value) : null;
  });

  function activateCampaign(campaignKey: CampaignKey) {
    const current = parseCampaignContext(context.value);
    if (current?.campaignKey === campaignKey && current.landingPath) return current;
    context.value = createCampaignContext(campaignKey, locale.value);
    return context.value;
  }

  function clearCampaign() {
    context.value = null;
    if (import.meta.client) sessionStorage.removeItem(STORAGE_KEY);
  }

  onMounted(() => {
    const handoff = Array.isArray(route.query.from) ? route.query.from[0] : route.query.from;
    if (isCampaignKey(handoff)) {
      activateCampaign(handoff);
      const query = { ...route.query };
      delete query.from;
      void router.replace({ path: route.path, query, hash: route.hash });
      return;
    }

    const stored = readCampaignContext(sessionStorage.getItem(STORAGE_KEY));
    if (stored) context.value = stored;
    else if (sessionStorage.getItem(STORAGE_KEY)) clearCampaign();
  });

  watch(
    context,
    (value) => {
      if (!import.meta.client) return;
      const valid = parseCampaignContext(value);
      if (valid) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      else sessionStorage.removeItem(STORAGE_KEY);
    },
    { deep: true, immediate: true },
  );

  return {
    context: computed(() => parseCampaignContext(context.value)),
    activateCampaign,
    clearCampaign,
  };
}
