import { addComponent, createResolver, defineNuxtModule } from "@nuxt/kit";
import { ginkoDocsAuthoringKitSource } from "./authoring";

export default defineNuxtModule({
  meta: { name: "@lupinum/ginko-docs/component-kit" },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);
    for (const { componentName } of Object.values(ginkoDocsAuthoringKitSource.implementation)) {
      addComponent({
        name: componentName,
        filePath: resolver.resolve(`./app/components/mdc/${componentName}.vue`),
        global: true,
      });
    }
    addComponent({
      name: "MdcCallout",
      filePath: resolver.resolve("./app/components/mdc/MdcCallout.vue"),
      global: true,
    });
    nuxt.options.css.push(resolver.resolve("./app/assets/css/component-kit.css"));
  },
});
