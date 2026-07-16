import { provideSSRWidth } from "@vueuse/core";
import { defineNuxtPlugin } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp);
});
