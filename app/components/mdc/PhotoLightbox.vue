<script setup lang="ts">
import { Lightbox, type LightboxCaptionSlotProps } from "@nuxt-photo/nuxt/app";
import { Button } from "@/components/ui/button";

function headingFor(photo: LightboxCaptionSlotProps["photo"]): string {
  return photo?.caption ?? photo?.alt ?? "";
}

function descriptionFor(photo: LightboxCaptionSlotProps["photo"]): string {
  return typeof photo?.description === "string" ? photo.description : "";
}
</script>

<template>
  <Lightbox>
    <template #counter="{ activeIndex, count }">
      <div
        class="inline-flex min-h-10 items-center rounded-full border border-border/70 bg-card px-3 text-xs font-medium text-card-foreground shadow-sm"
      >
        {{ activeIndex + 1 }} / {{ count }}
      </div>
    </template>

    <template
      #actions="{
        activeIndex,
        count,
        prev,
        next,
        close,
        toggleZoom,
        isZoomedIn,
        zoomAllowed,
        controlsDisabled,
      }"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="rounded-full border-border/70 bg-card shadow-sm"
        aria-label="Previous image"
        :disabled="controlsDisabled || activeIndex <= 0"
        @click="prev()"
      >
        <Icon name="lucide:chevron-left" class="size-4" aria-hidden="true" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        class="rounded-full border-border/70 bg-card shadow-sm"
        aria-label="Next image"
        :disabled="controlsDisabled || activeIndex >= count - 1"
        @click="next()"
      >
        <Icon name="lucide:chevron-right" class="size-4" aria-hidden="true" />
      </Button>

      <Button
        v-if="zoomAllowed"
        type="button"
        variant="outline"
        size="icon"
        class="rounded-full border-border/70 bg-card shadow-sm"
        :aria-label="isZoomedIn ? 'Zoom out' : 'Zoom in'"
        :disabled="controlsDisabled"
        @click="toggleZoom()"
      >
        <Icon
          :name="isZoomedIn ? 'lucide:zoom-out' : 'lucide:zoom-in'"
          class="size-4"
          aria-hidden="true"
        />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        class="rounded-full border-border/70 bg-card shadow-sm"
        aria-label="Close lightbox"
        :disabled="controlsDisabled"
        @click="close()"
      >
        <Icon name="lucide:x" class="size-4" aria-hidden="true" />
      </Button>
    </template>

    <template #caption="{ photo }">
      <div
        v-if="headingFor(photo) || descriptionFor(photo)"
        class="max-w-xl rounded-xl border border-border/70 bg-card px-4 py-3 text-left text-card-foreground shadow-md sm:px-5"
      >
        <p
          v-if="headingFor(photo)"
          class="text-sm leading-tight font-semibold text-card-foreground sm:text-base"
        >
          {{ headingFor(photo) }}
        </p>
        <p v-if="descriptionFor(photo)" class="mt-1 text-sm leading-relaxed text-muted-foreground">
          {{ descriptionFor(photo) }}
        </p>
      </div>
    </template>
  </Lightbox>
</template>
