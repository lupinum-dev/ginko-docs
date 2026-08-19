import type { GinkoDocsAppConfig } from "./shared/types/app-config";
import type {
  GinkoDocsNuxtConfig,
  GinkoDocsSyntaxHighlightingConfig,
} from "./shared/types/nuxt-config";

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

  interface NuxtConfig {
    ginkoDocs?: GinkoDocsNuxtConfig;
  }

  interface NuxtOptions {
    ginkoDocs?: GinkoDocsNuxtConfig;
  }

  interface PublicRuntimeConfig {
    ginkoDocs: {
      syntaxHighlighting: GinkoDocsSyntaxHighlightingConfig;
    };
  }
}

export {};
