import type { GinkoDocsAppConfig } from "./shared/types/app-config";

type GinkoDocsAppConfigInput<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [Key in keyof T]?: GinkoDocsAppConfigInput<T[Key]> }
    : T;

declare module "nuxt/schema" {
  interface AppConfig {
    ginkoDocs: GinkoDocsAppConfig;
  }

  interface AppConfigInput {
    ginkoDocs?: GinkoDocsAppConfigInput<GinkoDocsAppConfig>;
  }
}

export {};
