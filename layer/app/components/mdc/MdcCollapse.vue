<script setup lang="ts">
import { computed, onMounted, provide, ref, useId } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useI18n } from "#imports";
import { useProseAppearance } from "../../composables/useProseAppearance";

const props = defineProps<{ appearance?: "quiet" | "tint" }>();
const appearance = useProseAppearance("code", () => props.appearance);
// The clipped code block must render on the surface the collapse declares.
provide("contentCodeAppearance", appearance);

// Clips tall authored content (usually a long code block) at a fixed height
// until the reader expands it. Expanding removes the cap entirely, so the page
// owns scrolling instead of a nested scroll area.
const { t } = useI18n();
const regionId = useId();
const region = ref<HTMLElement | null>(null);
const expanded = ref(false);
const overflows = ref(false);
const lineCount = ref(0);

function measure() {
  const el = region.value;
  if (!el) return;
  overflows.value = el.scrollHeight - el.clientHeight > 2;
}

onMounted(() => {
  lineCount.value = region.value?.querySelectorAll("pre .line").length ?? 0;
  measure();
});
useResizeObserver(region, measure);

const label = computed(() =>
  lineCount.value ? t("docs.showAllLines", { count: lineCount.value }) : t("docs.showMore"),
);
</script>

<template>
  <div class="content-collapse" :data-appearance="appearance">
    <div
      :id="regionId"
      ref="region"
      class="content-collapse-region"
      :data-collapsed="!expanded || undefined"
    >
      <slot />
    </div>
    <div v-if="!expanded && overflows" class="content-collapse-fade">
      <button
        type="button"
        class="content-collapse-button"
        :aria-controls="regionId"
        aria-expanded="false"
        @click="expanded = true"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>
