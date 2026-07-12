import { useAppConfig } from "#imports";
import type { GinkoDocsAppConfig } from "../../shared/types/app-config";

export function useGinkoDocsConfig(): GinkoDocsAppConfig {
  return useAppConfig().ginkoDocs as GinkoDocsAppConfig;
}
