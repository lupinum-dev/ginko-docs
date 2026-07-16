import { useScriptPlausibleAnalytics } from "#imports";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";

export type AnalyticsProps = Record<string, string>;

export interface GinkoAnalytics {
  enabled: boolean;
  track: (event: string, props?: AnalyticsProps) => void;
}

/**
 * Plausible analytics via the Nuxt Scripts registry script. Fully disabled
 * unless `ginkoDocs.analytics.plausible.domain` is configured — without a
 * domain nothing loads and `track()` is a no-op, so callers never guard.
 */
export function useGinkoAnalytics(): GinkoAnalytics {
  const config = useGinkoDocsConfig();
  const plausible = config.analytics?.plausible;

  if (!plausible?.domain) {
    return { enabled: false, track: () => {} };
  }

  const script = useScriptPlausibleAnalytics({
    domain: plausible.domain,
    extension: plausible.extensions ?? ["outbound-links"],
    ...(plausible.scriptSrc ? { scriptInput: { src: plausible.scriptSrc } } : {}),
  });

  return {
    enabled: true,
    track: (event, props) => {
      if (!import.meta.client) return;
      script.proxy.plausible(event, props ? { props } : undefined);
    },
  };
}
