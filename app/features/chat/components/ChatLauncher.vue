<script setup lang="ts">
import { h, ref } from "vue";
import { useI18n } from "#imports";
import { useChat } from "@/features/chat/useChat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatConsentGate from "@/features/chat/components/ChatConsentGate.vue";

const { t } = useI18n();
const {
  availabilityText,
  canLoadProvider,
  closeChat,
  fallbackHref,
  fallbackLabel,
  isEnabled,
  needsConsent,
  openChat,
  trackFallbackContact,
} = useChat();

const isOpen = ref(false);

function open() {
  const result = openChat();
  if (result !== "disabled") {
    isOpen.value = true;
  }
}

function close() {
  closeChat();
  isOpen.value = false;
}

function setOpen(value: boolean) {
  if (value) {
    isOpen.value = true;
    return;
  }

  close();
}

function trackFallback() {
  trackFallbackContact("chat_launcher");
}
</script>

<template>
  <div v-if="isEnabled" class="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6">
    <Button
      type="button"
      size="lg"
      class="h-12 gap-2 rounded-full px-4 shadow-md"
      :aria-label="t('chat.launcherLabel')"
      @click="open"
    >
      <Icon name="lucide:messages-square" class="size-5" aria-hidden="true" />
      <span class="hidden text-sm font-medium sm:inline">{{ t("chat.launcherLabel") }}</span>
    </Button>

    <Dialog :open="isOpen" @update:open="setOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t("chat.title") }}</DialogTitle>
          <DialogDescription>{{ availabilityText }}</DialogDescription>
        </DialogHeader>

        <ChatConsentGate
          v-if="needsConsent"
          :availability-text="availabilityText"
          :fallback-href="fallbackHref"
          :fallback-label="fallbackLabel"
          @fallback="trackFallback"
        />

        <div v-else class="space-y-4">
          <div class="rounded-md border border-border bg-muted/40 p-4">
            <p class="text-sm font-medium text-foreground">{{ t("chat.providerTitle") }}</p>
            <p class="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {{ t("chat.providerDescription") }}
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <Button as="a" :href="fallbackHref" @click="trackFallback">
              {{ fallbackLabel }}
            </Button>
            <Button type="button" variant="outline" @click="close">
              {{ t("chat.close") }}
            </Button>
          </div>
        </div>

        <p v-if="canLoadProvider" class="sr-only">{{ t("chat.providerReady") }}</p>
      </DialogContent>
    </Dialog>
  </div>
</template>
