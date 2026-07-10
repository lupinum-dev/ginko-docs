<script setup lang="ts">
import type { VNode } from "vue";
import { computed, useSlots } from "vue";
import { PhotoAlbum, type PhotoItem } from "@nuxt-photo/nuxt/app";
import PhotoLightbox from "./PhotoLightbox.vue";
import { cn } from "@/lib/utils";

type LayoutType = "rows" | "columns" | "masonry";

function coerceNumber(value: number | string | undefined, fallback: number): number {
  if (value === undefined || value === "") return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const props = withDefaults(
  defineProps<{
    layout?: LayoutType;
    columns?: number | string;
    spacing?: number | string;
    targetRowHeight?: number | string;
    bleed?: boolean;
    caption?: string;
  }>(),
  {
    layout: "masonry",
    columns: 3,
    spacing: 8,
    targetRowHeight: 300,
    bleed: undefined,
  },
);

const slots = useSlots();

const numericColumns = computed(() => coerceNumber(props.columns, 3));
const numericSpacing = computed(() => coerceNumber(props.spacing, 8));
const numericTargetRowHeight = computed(() => coerceNumber(props.targetRowHeight, 300));
const shouldBleed = computed(() => props.bleed === true);

function extractImages(vnodes: VNode[]): PhotoItem[] {
  const images: PhotoItem[] = [];

  function uniquePhotoId(base: string) {
    const id = base.trim() || "gallery-image";
    return `${id}-${images.length + 1}`;
  }

  function resolveStringProp(
    nodeProps: Record<string, unknown>,
    ...keys: string[]
  ): string | undefined {
    for (const key of keys) {
      const value = nodeProps[key];
      if (typeof value === "string" && value.length > 0) {
        return value;
      }
    }

    return undefined;
  }

  function walk(nodes: VNode[]) {
    for (const node of nodes) {
      const nodeProps = node.props;
      if (nodeProps && typeof nodeProps.src === "string" && nodeProps.width && nodeProps.height) {
        const explicitId = resolveStringProp(nodeProps as Record<string, unknown>, "id");
        images.push({
          id: uniquePhotoId(explicitId ?? nodeProps.src),
          src: nodeProps.src,
          width: Number(nodeProps.width),
          height: Number(nodeProps.height),
          alt: typeof nodeProps.alt === "string" ? nodeProps.alt : undefined,
          caption: typeof nodeProps.caption === "string" ? nodeProps.caption : undefined,
          description:
            typeof nodeProps.description === "string" ? nodeProps.description : undefined,
          thumbSrc: resolveStringProp(
            nodeProps as Record<string, unknown>,
            "thumbSrc",
            "thumb-src",
          ),
        });
        continue;
      }

      if (typeof node.type === "string" && node.type === "img" && nodeProps) {
        const width = Number(nodeProps.width);
        const height = Number(nodeProps.height);
        if (width > 0 && height > 0) {
          images.push({
            id: uniquePhotoId(nodeProps.src as string),
            src: nodeProps.src as string,
            width,
            height,
            alt: typeof nodeProps.alt === "string" ? nodeProps.alt : undefined,
          });
          continue;
        }
      }

      if (Array.isArray(node.children)) {
        walk(node.children as VNode[]);
      } else if (node.children && typeof node.children === "object" && "default" in node.children) {
        const defaultSlot = (node.children as Record<string, () => VNode[]>).default;
        if (typeof defaultSlot === "function") {
          walk(defaultSlot());
        }
      }
    }
  }

  walk(vnodes);
  return images.filter((img) => img.width > 0 && img.height > 0);
}

const items = computed(() => extractImages(slots.default?.() ?? []));

const rootClass = computed(() =>
  cn("content-media not-prose relative", shouldBleed.value && "w-auto"),
);
</script>

<template>
  <div :class="rootClass" :data-bleed="shouldBleed ? 'true' : undefined">
    <PhotoAlbum
      :photos="items"
      :layout="layout"
      :columns="numericColumns"
      :spacing="numericSpacing"
      :padding="0"
      :target-row-height="numericTargetRowHeight"
      :default-container-width="shouldBleed ? 900 : 760"
      :lightbox="PhotoLightbox"
      item-class="overflow-hidden rounded-xl"
      img-class="w-full object-cover"
    />
    <p v-if="caption" class="content-caption mt-3 text-center">
      {{ caption }}
    </p>
  </div>
</template>
