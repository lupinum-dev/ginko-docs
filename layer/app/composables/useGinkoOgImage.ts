import { defineOgImage } from "#imports";
import { useGinkoDocsConfig } from "./useGinkoDocsConfig";

export interface GinkoOgImageProps {
  title?: string;
  description?: string;
  locale?: string;
  [key: string]: unknown;
}

/**
 * Declares the page's social image using the configured OgImage template.
 * No-op when the consumer sets `ginkoDocs.ogImage.enabled: false`.
 */
export function useGinkoOgImage(props?: GinkoOgImageProps) {
  const config = useGinkoDocsConfig();
  if (config.ogImage?.enabled === false) return;
  const component = config.ogImage?.component ?? "GinkoDocs";
  defineOgImage(component as never, props as never);
}
