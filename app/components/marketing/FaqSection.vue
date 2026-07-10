<script setup lang="ts">
import { createFaqSchema } from "@/lib/schema-org";
import { useSchemaJsonLd } from "@/composables/useSchemaJsonLd";
import { useTracking } from "@/composables/useTracking";
import BusinessSectionHeader from "@/components/marketing/SectionHeader.vue";

export interface BusinessFaqItem {
  question: string;
  answer: string;
}

const props = defineProps<{
  eyebrow?: string;
  headline: string;
  items: BusinessFaqItem[];
}>();

const { trackFaq } = useTracking();

useSchemaJsonLd(() => createFaqSchema(props.items));

function trackOpen(question: string, event: Event) {
  if (event.target instanceof HTMLDetailsElement && event.target.open) {
    trackFaq(question);
  }
}
</script>

<template>
  <section v-if="props.items.length" class="site-section">
    <div class="site-container">
      <BusinessSectionHeader :eyebrow="eyebrow" :headline="headline" align="center" class="mb-12" />
      <div class="mx-auto max-w-2xl">
        <div class="w-full divide-y">
          <details
            v-for="(item, index) in props.items"
            :key="index"
            class="group"
            @toggle="trackOpen(item.question, $event)"
          >
            <summary
              class="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md py-5 text-left text-sm font-medium transition-colors outline-none hover:text-primary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden"
            >
              <span>{{ item.question }}</span>
              <Icon
                name="lucide:chevron-down"
                class="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p class="pb-4 text-sm leading-relaxed text-muted-foreground">
              {{ item.answer }}
            </p>
          </details>
        </div>
      </div>
    </div>
  </section>
</template>
