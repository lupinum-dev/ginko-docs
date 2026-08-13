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
      "docs/.nuxt/**",
    ],
  },
  ...pluginVue.configs["flat/essential"],
  {
    files: ["layer/**/*.vue"],
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
];
