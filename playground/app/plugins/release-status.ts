import { defineNuxtPlugin } from "#app";
import MdcReleaseStatus from "../components/MdcReleaseStatus.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("MdcReleaseStatus", MdcReleaseStatus);
});
