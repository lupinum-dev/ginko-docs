export default defineNuxtConfig({
  extends: ["../layer"],
  site: { url: "https://docs.example.com" },
  i18n: {
    baseUrl: "https://docs.example.com",
    locales: [
      { code: "en", language: "en-US", name: "English" },
      { code: "de", language: "de-AT", name: "Deutsch" },
    ],
  },
  nitro: { prerender: { routes: ["/de/llms.txt", "/de/llms-full.txt"] } },
});
