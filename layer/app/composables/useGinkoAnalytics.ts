import { useScriptPlausibleAnalytics } from "#imports";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";

const PLAUSIBLE_INITIALIZER =
  "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()";

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

  const src = `https://plausible.io/js/pa-${scriptId}.js`;
  useHead({
    script: [
      { key: "plausibleAnalytics", src, async: true },
      { key: "plausibleAnalyticsInit", innerHTML: PLAUSIBLE_INITIALIZER },
    ],
  });

  const script = useScriptPlausibleAnalytics({
    scriptId,
    // Plausible verifies its exact snippet in server-rendered HTML. The head
    // entry above provides it; Nuxt Scripts reuses the same keyed script for
    // its typed proxy and lifecycle instead of adding a second tracker.
    scriptOptions: { bundle: false },
  });

  return {
    enabled: true,
    track: (event, props) => {
      if (!import.meta.client) return;
      const plausible = script.proxy.plausible;
      if (typeof plausible !== "function") return;
      plausible(event, props ? { props } : undefined);
    },
  };
}
