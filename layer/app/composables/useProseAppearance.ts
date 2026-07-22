import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { GinkoDocsProseAppearance, GinkoDocsProseFamily } from "../../shared/types/app-config";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";

const DEFAULT_APPEARANCE: GinkoDocsProseAppearance = "quiet";

function normalizeAppearance(value: unknown): GinkoDocsProseAppearance | undefined {
  return value === "quiet" || value === "tint" ? value : undefined;
}

export function useProseAppearance(
  family: GinkoDocsProseFamily,
  appearance?: MaybeRefOrGetter<string | undefined>,
) {
  const config = useGinkoDocsConfig();

  return computed<GinkoDocsProseAppearance>(
    () =>
      normalizeAppearance(toValue(appearance)) ??
      normalizeAppearance(config.prose?.components?.[family]) ??
      normalizeAppearance(config.prose?.appearance) ??
      DEFAULT_APPEARANCE,
  );
}
