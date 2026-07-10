<script setup lang="ts">
import { watch } from "vue";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "#imports";
import { useCookieConsent } from "@/composables/useCookieConsent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const props = defineProps<{ open: boolean }>();
const { t } = useI18n();
const {
  acceptAll: acceptConsentAll,
  categories,
  preferences,
  rejectOptional,
  savePreferences,
} = useCookieConsent();

const emit = defineEmits<{
  "update:open": [value: boolean];
  accept: [];
  reject: [];
  save: [preferences: Record<string, boolean>];
  close: [];
}>();

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) emit("close");
  },
);

function acceptAll() {
  acceptConsentAll();
  emit("accept");
  emit("update:open", false);
}

function rejectAll() {
  rejectOptional();
  emit("reject");
  emit("update:open", false);
}

function save() {
  const stored = savePreferences(preferences.value);
  emit("save", stored.preferences);
  emit("update:open", false);
}

function categoryLabel(id: string) {
  return t(`cookie.categories.${id}.label`);
}

function categoryDescription(id: string) {
  return t(`cookie.categories.${id}.description`);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent size="lg" class="flex max-h-[90dvh] flex-col overflow-hidden p-0">
      <DialogHeader class="shrink-0 px-6 pt-6 pb-4">
        <div class="mb-2 flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Icon name="lucide:shield" class="size-5 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle class="text-xl">{{ t("cookie.preferencesTitle") }}</DialogTitle>
        </div>
        <DialogDescription class="mt-2 text-left leading-relaxed">
          {{ t("cookie.modalDescription") }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 border-y border-border px-6">
        <div class="space-y-6 py-4">
          <div
            v-for="category in categories"
            :key="category.id"
            class="flex items-start justify-between gap-4"
          >
            <div class="flex-1">
              <label
                :for="`cookie-${category.id}`"
                class="cursor-pointer text-sm font-semibold text-foreground"
              >
                {{ categoryLabel(category.id) }}
              </label>
              <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
                {{ categoryDescription(category.id) }}
              </p>
            </div>
            <Switch
              :id="`cookie-${category.id}`"
              v-model="preferences[category.id]"
              :disabled="!category.configurable"
            />
          </div>
        </div>
      </ScrollArea>

      <DialogFooter
        class="shrink-0 gap-2 border-t border-border bg-muted/30 px-6 py-4 sm:justify-between"
      >
        <Button class="w-full sm:w-auto" variant="ghost" @click="rejectAll">
          {{ t("cookie.rejectAll") }}
        </Button>
        <div class="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
          <Button class="w-full sm:w-auto" variant="outline" @click="save">
            {{ t("cookie.save") }}
          </Button>
          <Button class="w-full sm:w-auto" @click="acceptAll">{{ t("cookie.acceptAll") }}</Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
