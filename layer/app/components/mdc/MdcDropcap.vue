<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import { cn } from "../../utils";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<{
    /**
     * Drop cap spans this many line boxes (`initial-letter` size / sink).
     * Markdown props may arrive as strings.
     */
    lines?: number | string;
    class?: HTMLAttributes["class"];
  }>(),
  { lines: 2 },
);

const lineCount = computed(() => {
  const n = Math.round(Number(props.lines));
  if (Number.isFinite(n) && n >= 2 && n <= 4) return n;
  return 2;
});

const dropcapStyle = computed(
  (): CSSProperties => ({
    "--mdc-dropcap-lines": String(lineCount.value),
  }),
);
</script>

<template>
  <div
    :class="
      cn(
        'mdc-dropcap content-prose content-prose-trim not-prose my-6 text-pretty [&>p]:text-muted-foreground',
        '[&>p:not(:first-of-type)]:mt-4',
        '[&>p:first-of-type]:flow-root',
        props.class,
      )
    "
    :style="dropcapStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
.mdc-dropcap {
  --mdc-dropcap-lines: 2;
}

.mdc-dropcap :deep(p:first-of-type)::first-letter {
  font-weight: 600;
  color: var(--foreground);
  margin-inline-end: 0.15em;
}

/* CSS Inline Layout 3: typographic alignment vs float hacks (Chrome 110+, Safari + webkit prefix). */
@supports (-webkit-initial-letter: 2) or (initial-letter: 1 1) {
  .mdc-dropcap :deep(p:first-of-type)::first-letter {
    -webkit-initial-letter: var(--mdc-dropcap-lines);
    initial-letter: var(--mdc-dropcap-lines);
  }
}

/* Firefox and legacy: float plus glyph height approximates N line boxes (`lh` ties to paragraph leading). */
@supports (not ((-webkit-initial-letter: 2) or (initial-letter: 1 1))) {
  .mdc-dropcap :deep(p:first-of-type)::first-letter {
    float: left;
    line-height: 1;
    margin-top: 0.08em;
    margin-bottom: -0.06em;
    font-size: calc(var(--mdc-dropcap-lines) * 1.325em);
  }

  @supports (font-size: 1lh) {
    .mdc-dropcap :deep(p:first-of-type)::first-letter {
      font-size: calc(var(--mdc-dropcap-lines) * 1lh);
      margin-top: 0.05em;
      margin-bottom: -0.06em;
    }
  }
}
</style>
