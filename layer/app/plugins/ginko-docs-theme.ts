import { defineNuxtPlugin, useAppConfig, useHead } from "#imports";

export default defineNuxtPlugin(() => {
  const { theme } = useAppConfig().ginkoDocs;

  useHead({
    htmlAttrs: {
      "data-neutral": theme.neutral,
      "data-primary": theme.primary,
      "data-code-blocks": theme.codeBlocks,
    },
  });
});
