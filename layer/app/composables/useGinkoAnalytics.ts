import { useScriptPlausibleAnalytics } from "#imports";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";

export type AnalyticsProps = Record<string, string>;

export interface GinkoAnalytics {
  enabled: boolean;
  track: (event: string, props?: AnalyticsProps) => void;
}

/**
 * Plausible analytics via the Nuxt Scripts registry script. Fully disabled
 * unless `ginkoDocs.analytics.plausible.scriptId` is configured. Without an
 * ID, no script loads and `track()` is a no-op, so callers never guard.
 */
export function useGinkoAnalytics(): GinkoAnalytics {
  const config = useGinkoDocsConfig();
  const scriptId = config.analytics?.plausible?.scriptId?.trim();

  if (!scriptId) {
    return { enabled: false, track: () => {} };
  }

  const script = useScriptPlausibleAnalytics({
    scriptId,
    // The site ID comes from app.config at runtime. Keep the vendor script
    // external so Nuxt Scripts does not bundle its legacy fallback URL during
    // the build-time transform.
    scriptOptions: { bundle: false, proxy: false },
  });

  return {
    enabled: true,
    track: (event, props) => {
      if (!import.meta.client) return;
      script.proxy.plausible(event, props ? { props } : undefined);
    },
  };
}
