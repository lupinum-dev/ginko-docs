<script setup lang="ts">
import { useId } from "vue";
import { AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from "reka-ui";

const props = defineProps<{
  value?: string;
  title?: string;
  content?: string;
}>();

const autoValue = useId();
</script>

<template>
  <AccordionItem
    :value="props.value || autoValue"
    :data-accordion-value="props.value || autoValue"
    class="content-accordion-item"
  >
    <AccordionHeader class="content-accordion-header">
      <AccordionTrigger class="content-accordion-trigger">
        <slot name="title">
          {{ title }}
        </slot>
        <Icon name="lucide:chevron-down" class="content-accordion-chevron" aria-hidden="true" />
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent
      data-slot="accordion-content"
      class="content-accordion-content accordion-content"
    >
      <slot name="content">
        <div v-if="content" class="content-accordion-copy">
          {{ content }}
        </div>
      </slot>
      <div v-if="$slots.default" class="content-accordion-copy content-prose content-prose-trim">
        <slot unwrap="p" />
      </div>
    </AccordionContent>
  </AccordionItem>
</template>
