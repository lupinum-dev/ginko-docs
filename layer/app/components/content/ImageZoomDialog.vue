<script setup lang="ts">
import { AnimatePresence, Motion } from "motion-v";
import { ref, useId } from "vue";
import {
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";
import { useI18n } from "#imports";
import { useImageZoomMotion } from "./imageZoom";

defineProps<{
  src?: string;
  alt?: string;
  /** Accessible dialog title; falls back to alt, then the zoom label. */
  label?: string;
  description?: string;
}>();

const { t } = useI18n();
const open = ref(false);
const layoutId = `ginko-image-${useId()}`;
const { imageTransition, fadeTransition } = useImageZoomMotion();
</script>

<template>
  <DialogRoot v-model:open="open" :modal="false">
    <DialogTrigger as-child>
      <slot name="trigger" :layout-id="layoutId" :transition="imageTransition" />
    </DialogTrigger>

    <DialogPortal>
      <AnimatePresence>
        <Motion
          v-if="open"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="fadeTransition"
          class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm will-change-opacity"
        />

        <DialogContent
          v-if="open"
          class="fixed inset-0 z-50 flex cursor-zoom-out flex-col items-center justify-center gap-4 p-[4vw] focus:outline-none"
          @click="open = false"
        >
          <DialogTitle class="sr-only">{{ label || alt || t("docs.zoomImage") }}</DialogTitle>
          <DialogDescription class="sr-only">{{
            description || alt || t("docs.zoomImage")
          }}</DialogDescription>

          <Motion as-child :layout-id="layoutId" :transition="imageTransition">
            <img
              :src="src"
              :alt="alt"
              class="max-h-[82dvh] w-auto max-w-[min(94vw,80rem)] rounded-lg object-contain will-change-transform"
            />
          </Motion>

          <Motion
            v-if="label || alt"
            as-child
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -4 }"
            :transition="fadeTransition"
          >
            <p
              aria-hidden="true"
              class="max-w-[min(92vw,40rem)] rounded-full border border-border bg-background px-4 py-1.5 text-center text-sm shadow-sm"
            >
              {{ label || alt
              }}<span v-if="description" class="text-muted-foreground"> · {{ description }}</span>
            </p>
          </Motion>
        </DialogContent>
      </AnimatePresence>
    </DialogPortal>
  </DialogRoot>
</template>
