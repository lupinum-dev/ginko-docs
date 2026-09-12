import { addComponent, createResolver, defineNuxtModule } from "@nuxt/kit";
import { contentComponentTags } from "./tags";

const authoredTags = ["column", "info", "layout"] as const;

export default defineNuxtModule({
  meta: { name: "@lupinum/ginko-docs/component-kit" },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);
    for (const tag of authoredTags) {
      addComponent({
        name: contentComponentTags[tag],
        filePath: resolver.resolve(`./app/components/mdc/${contentComponentTags[tag]}.vue`),
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
