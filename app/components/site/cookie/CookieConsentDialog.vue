<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";

defineProps<{
  open: boolean;
}>();
const { t } = useI18n();
const localizedPath = useLocalizedPath();

const emit = defineEmits<{
  "update:open": [value: boolean];
  accept: [];
  reject: [];
  manage: [];
}>();

function acceptAll() {
  emit("accept");
  emit("update:open", false);
}

function rejectOptional() {
  emit("reject");
  emit("update:open", false);
}

function openManage() {
  emit("manage");
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      :show-close="false"
      size="sm"
      class="gap-0 overflow-hidden p-0 sm:w-[450px]"
      @escape-key-down.prevent
      @interact-outside.prevent
    >
      <div class="p-5 pb-4 sm:p-6">
        <div class="flex items-start justify-between">
          <div>
            <div
              class="mb-3 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10"
            >
              <Icon name="lucide:cookie" class="size-6 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle class="text-xl font-bold text-foreground">
              {{ t("cookie.policyTitle") }}
            </DialogTitle>
          </div>

          <button
            :aria-label="t('cookie.close')"
            class="ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            type="button"
            @click="rejectOptional"
          >
            <Icon name="lucide:x" class="size-4" aria-hidden="true" />
          </button>
        </div>

        <DialogDescription class="mt-4 text-sm leading-relaxed text-muted-foreground">
          {{ t("cookie.dialogDescription") }}
          <NuxtLink
            class="text-primary transition-colors hover:text-primary/80 hover:underline"
            :to="localizedPath('privacy')"
          >
            {{ t("cookie.policyLink") }}.
          </NuxtLink>
        </DialogDescription>
      </div>

      <div class="border-t border-border bg-muted/30 p-4 sm:px-6">
        <div class="flex flex-col gap-3 sm:flex-row">
          <Button class="flex-1 bg-background" variant="outline" @click="openManage">
            {{ t("cookie.manage") }}
          </Button>
          <Button class="flex-1" @click="acceptAll">{{ t("cookie.acceptAll") }}</Button>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <NuxtLink
            class="px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            :to="localizedPath('imprint')"
          >
            {{ t("cookie.imprint") }}
          </NuxtLink>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
