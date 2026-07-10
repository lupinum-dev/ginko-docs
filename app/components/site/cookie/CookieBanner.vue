<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useI18n } from "#imports";

defineProps<{
  open: boolean;
}>();
const { t } = useI18n();

const emit = defineEmits<{
  "update:open": [value: boolean];
  accept: [];
  reject: [];
  manage: [];
  close: [];
}>();

function closeBanner() {
  emit("close");
  emit("update:open", false);
}

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
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-8 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-8 opacity-0"
  >
    <div
      v-if="open"
      class="fixed right-0 bottom-0 left-0 z-50 p-4 sm:right-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:p-0 md:bottom-8 md:left-8"
    >
      <div
        class="relative rounded-xl border border-border bg-card p-5 shadow-md sm:p-6 dark:shadow-none"
      >
        <button
          class="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          type="button"
          @click="closeBanner"
        >
          <Icon name="lucide:x" class="size-4" aria-hidden="true" />
          <span class="sr-only">{{ t("cookie.close") }}</span>
        </button>

        <div class="pr-6">
          <div class="mb-2 flex items-center gap-2">
            <Icon name="lucide:cookie" class="size-5 text-primary" aria-hidden="true" />
            <h3 class="text-lg font-semibold text-foreground">{{ t("cookie.title") }}</h3>
          </div>
          <p class="text-sm leading-relaxed text-muted-foreground">
            {{ t("cookie.description") }}
          </p>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button class="w-full sm:w-auto" variant="ghost" @click="openManage">
            {{ t("cookie.manage") }}
          </Button>
          <div class="hidden flex-1 sm:block"></div>
          <Button class="w-full sm:w-auto" variant="outline" @click="rejectOptional">
            {{ t("cookie.rejectOptional") }}
          </Button>
          <Button class="w-full sm:w-auto" @click="acceptAll">{{ t("cookie.acceptAll") }}</Button>
        </div>
      </div>
    </div>
  </Transition>
</template>
