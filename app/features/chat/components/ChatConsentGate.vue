<script setup lang="ts">
import { useI18n } from "#imports";
import { Button } from "@/components/ui/button";

defineProps<{
  availabilityText: string;
  fallbackHref: string;
  fallbackLabel: string;
}>();

defineEmits<{
  fallback: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-4 rounded-md border border-border bg-muted/40 p-4">
    <div class="flex gap-3">
      <Icon
        name="lucide:shield-check"
        class="mt-0.5 size-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <div class="space-y-1.5">
        <p class="text-sm font-medium text-foreground">{{ t("chat.consentTitle") }}</p>
        <p class="text-sm leading-relaxed text-muted-foreground">
          {{ t("chat.consentDescription") }}
        </p>
      </div>
    </div>

    <p class="text-sm leading-relaxed text-muted-foreground">{{ availabilityText }}</p>

    <Button as="a" variant="outline" :href="fallbackHref" @click="$emit('fallback')">
      {{ fallbackLabel }}
    </Button>
  </div>
</template>
