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
import { useDocsText } from "../../composables/useDocsText";
import { useImageZoomMotion } from "./imageZoom";

defineProps<{
  src?: string;
  alt?: string;
  /** Accessible dialog title; falls back to alt, then the zoom label. */
  label?: string;
  description?: string;
}>();

const { t } = useDocsText();
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
          class="image-zoom-backdrop"
        />

        <DialogContent v-if="open" class="image-zoom-dialog" @click="open = false">
          <DialogTitle class="image-zoom-sr-only">{{
            label || alt || t("docs.zoomImage")
          }}</DialogTitle>
          <DialogDescription class="image-zoom-sr-only">{{
            description || alt || t("docs.zoomImage")
          }}</DialogDescription>

          <Motion as-child :layout-id="layoutId" :transition="imageTransition">
            <img :src="src" :alt="alt" class="image-zoom-image" />
          </Motion>

          <Motion
            v-if="label || alt"
            as-child
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -4 }"
            :transition="fadeTransition"
          >
            <p aria-hidden="true" class="image-zoom-caption">
              {{ label || alt
              }}<span v-if="description" class="image-zoom-description"> · {{ description }}</span>
            </p>
          </Motion>
        </DialogContent>
      </AnimatePresence>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Shared by the Docs layer and the component kit: no host utility CSS needed. */
.image-zoom-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--background, white) 80%, transparent);
  backdrop-filter: blur(8px);
  will-change: opacity;
}
.image-zoom-dialog {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4vw;
  cursor: zoom-out;
  outline: none;
}
.image-zoom-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.image-zoom-image {
  max-height: 82dvh;
  width: auto;
  max-width: min(94vw, 80rem);
  border-radius: var(--radius, 0.625rem);
  object-fit: contain;
  will-change: transform;
}
.image-zoom-caption {
  margin: 0;
  max-width: min(92vw, 40rem);
  border: 1px solid var(--border, #d4d4d4);
  border-radius: 9999px;
  background: var(--background, white);
  padding: 0.375rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: var(--shadow-sm, 0 1px 3px rgb(0 0 0 / 0.1));
}
.image-zoom-description {
  color: var(--muted-foreground, #666);
}
</style>
