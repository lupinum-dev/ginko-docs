<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useAnimationFrame } from "motion-v";

const rowCount = 6;
const columnCount = 7;
const maxMoveAmount = 280;
const rowCurrent = Array.from({ length: rowCount }, () => 0);
const rowTarget = Array.from({ length: rowCount }, () => 0);
const rowRefs = ref<HTMLElement[]>([]);

const images = [
  "/images/home/references/OfficeToGo.png",
  "/images/home/references/Gloesmann.png",
  "/images/home/references/Prem_square.jpg",
] as const;
const prefersReducedMotion = ref(false);

function getItem(rowIndex: number, itemIndex: number) {
  return images[(rowIndex * columnCount + itemIndex) % images.length] ?? images[0];
}

function updateRows(clientX: number) {
  const viewportWidth = window.innerWidth || 1;

  rowTarget.forEach((_, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    rowTarget[index] = ((clientX / viewportWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;
  });
}

function handlePointerMove(event: PointerEvent) {
  if (prefersReducedMotion.value) return;
  updateRows(event.clientX);
}

useAnimationFrame(() => {
  if (prefersReducedMotion.value) return;

  rowRefs.value.forEach((row, index) => {
    const inertia = 0.09 - (index % 4) * 0.012;
    const current = rowCurrent[index] ?? 0;
    const target = rowTarget[index] ?? 0;
    const next = current + (target - current) * inertia;

    rowCurrent[index] = next;
    row.style.transform = `translate3d(${next.toFixed(3)}px, 0, 0)`;
  });
});

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion.value) return;

  updateRows(window.innerWidth / 2);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", handlePointerMove);
});
</script>

<template>
  <div class="relative isolate h-full w-full overflow-hidden bg-gray-950" aria-hidden="true">
    <div
      class="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.25)_44%,rgba(3,7,18,0.88)_100%)]"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[4] bg-[linear-gradient(to_bottom,rgba(248,250,252,0.16),transparent_18%,transparent_80%,rgba(248,250,252,0.12))]"
    />

    <div
      class="relative z-[2] grid h-[150%] w-[150%] -translate-x-[10%] -translate-y-[20%] rotate-[-15deg] grid-cols-1 gap-3 sm:gap-4"
    >
      <div
        v-for="rowIndex in rowCount"
        :key="rowIndex"
        ref="rowRefs"
        class="flex gap-4"
        style="will-change: transform; transform: translate3d(0, 0, 0)"
      >
        <div
          v-for="itemIndex in columnCount"
          :key="itemIndex"
          class="relative h-[120px] min-w-[170px] shrink-0 overflow-hidden rounded-panel bg-gray-900 shadow-lg ring-1 ring-white/10 sm:h-[160px] sm:min-w-[220px] lg:h-[190px] lg:min-w-[270px]"
        >
          <img
            :src="getItem(rowIndex - 1, itemIndex - 1)"
            alt=""
            class="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </div>
</template>
