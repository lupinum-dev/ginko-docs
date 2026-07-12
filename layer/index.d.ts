import type { GinkoDocsAppConfig } from "./shared/types/app-config";

declare module "nuxt/schema" {
  interface AppConfig {
    ginkoDocs: GinkoDocsAppConfig;
  }

  interface AppConfigInput {
    ginkoDocs?: Partial<GinkoDocsAppConfig>;
  }
}

export {};
