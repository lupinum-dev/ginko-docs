<script setup lang="ts">
import { useI18n } from "#imports";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#ginko-docs/components/ui/dialog";

defineProps<{
  src?: string;
  alt?: string;
  /** Accessible dialog title; falls back to alt, then the zoom label. */
  label?: string;
  description?: string;
}>();

const open = defineModel<boolean>("open", { default: false });
const { t } = useI18n();
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="max-h-[90dvh] w-auto max-w-[min(96vw,80rem)] overflow-auto border-none bg-transparent p-0 shadow-none"
    >
      <DialogTitle class="sr-only">{{ label || alt || t("docs.zoomImage") }}</DialogTitle>
      <DialogDescription v-if="description" class="sr-only">{{ description }}</DialogDescription>
      <img :src="src" :alt="alt" class="max-h-[88dvh] w-auto rounded-lg object-contain" />
    </DialogContent>
  </Dialog>
</template>
