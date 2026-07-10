import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "--host/**",
      ".cache/**",
      ".nuxt/**",
      ".output/**",
      ".turbo/**",
      ".vite/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "packages/*/dist/**",
    ],
  },
  ...pluginVue.configs["flat/essential"],
  {
    files: ["app/**/*.vue", "packages/**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "error",
      "vue/require-valid-default-prop": "off",
    },
  },
  {
    files: ["app/components/site/ServiceLoader.vue"],
    rules: {
      "vue/valid-template-root": "off",
    },
  },
];
