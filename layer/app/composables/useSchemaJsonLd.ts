import { toValue, type MaybeRefOrGetter } from "vue";
import { useHead } from "#imports";

export type SchemaJsonNode = Record<string, unknown>;

export function useSchemaJsonLd(schemas: MaybeRefOrGetter<SchemaJsonNode[]>) {
  useHead(() => {
    const graph = toValue(schemas).filter(Boolean);

    return {
      script: graph.length
        ? [
            {
              type: "application/ld+json",
              "data-schema-org": "true",
              innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": graph,
              }),
            },
          ]
        : [],
    };
  });
}
