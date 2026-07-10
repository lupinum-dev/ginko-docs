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
    class="border-b last:border-b-0"
  >
    <AccordionHeader class="flex">
      <AccordionTrigger
        class="flex flex-1 items-start justify-between gap-4 rounded-md px-4 py-3 text-left text-sm font-medium transition-all outline-none hover:no-underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180"
      >
        <slot name="title">
          {{ title }}
        </slot>
        <Icon
          name="lucide:chevron-down"
          class="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200"
          aria-hidden="true"
        />
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent
      data-slot="accordion-content"
      class="accordion-content overflow-hidden text-sm"
    >
      <slot name="content">
        <div v-if="content" class="text-muted-foreground">
          {{ content }}
        </div>
      </slot>
      <div
        v-if="$slots.default"
        class="content-prose content-prose-trim px-4 pb-2 text-muted-foreground"
      >
        <slot unwrap="p" />
      </div>
    </AccordionContent>
  </AccordionItem>
</template>
