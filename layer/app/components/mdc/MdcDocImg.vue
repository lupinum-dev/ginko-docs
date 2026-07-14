<script setup lang="ts">
import { computed } from "vue";

/**
 * Wrap standalone `![alt](url)` lines in markdown with this block so Comark can
 * keep the image outside paragraph wrappers.
 * Avoids invalid `<p><figure>...</figure></p>` and hydration mismatches.
 *
 * @example
 * ::doc-img
 * ![Alt text](https://shadcn-starter.ginko-content.dev/images/example.jpg)
 * ::
 */
const props = withDefaults(defineProps<{ bleed?: boolean | string }>(), { bleed: undefined });

const shouldBleed = computed(
  () => props.bleed === true || props.bleed === "true" || props.bleed === "outside",
);
</script>

<template>
  <div class="content-doc-img" :data-bleed="shouldBleed ? 'true' : undefined">
    <slot unwrap="p" />
  </div>
</template>
