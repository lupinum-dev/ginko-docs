import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";

export type ScrollspyHeading = {
  id: string;
  /** Viewport-relative top, in document order. */
  top: number;
};

export type ScrollspyZone = {
  zoneTop: number;
  zoneBottom: number;
  /** Viewport-relative bottom of the document (scrollHeight - scrollY). */
  docEnd: number;
  /** When the page is scrolled to the very bottom, the zone extends to docEnd
   * so a short final section still activates. */
  atBottom: boolean;
};

// Headings use `scroll-margin-top: 7rem` (= ZONE_TOP), so after an anchor jump
// the clicked heading sits exactly at the zone top and becomes the first
// active entry. The tolerance absorbs sub-pixel layout drift.
const ZONE_TOP = 112;
const TOLERANCE = 8;

/**
 * A heading is active while any part of its section (heading → next heading)
 * intersects the reading zone. Pure so the zone model is unit-testable.
 */
export function computeActiveIds(headings: ScrollspyHeading[], zone: ScrollspyZone): string[] {
  if (headings.length === 0) return [];

  const zoneTop = zone.zoneTop + TOLERANCE;
  const zoneBottom = zone.atBottom ? zone.docEnd : zone.zoneBottom;

  const active: string[] = [];
  for (let index = 0; index < headings.length; index++) {
    const sectionTop = headings[index]!.top;
    const sectionBottom = index < headings.length - 1 ? headings[index + 1]!.top : zone.docEnd;
    if (sectionBottom > zoneTop && sectionTop < zoneBottom) {
      active.push(headings[index]!.id);
    }
  }
  if (active.length > 0) return active;

  // No section in the zone (e.g. a long passage between headings): fall back
  // to the last heading scrolled past the zone top, then to the first heading.
  for (let index = headings.length - 1; index >= 0; index--) {
    if (headings[index]!.top <= zoneTop) return [headings[index]!.id];
  }
  return [headings[0]!.id];
}

export function useScrollspy(ids: MaybeRefOrGetter<string[]>) {
  const activeIds = ref<string[]>([]);
  let observed: HTMLElement[] = [];
  let rafId: number | null = null;

  function update() {
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const next = computeActiveIds(
      observed.map((element) => ({
        id: element.id,
        top: element.getBoundingClientRect().top,
      })),
      {
        zoneTop: ZONE_TOP,
        zoneBottom: innerHeight * 0.8,
        docEnd: scrollHeight - scrollY,
        atBottom: scrollY + innerHeight >= scrollHeight - 2,
      },
    );
    if (
      next.length !== activeIds.value.length ||
      next.some((id, index) => id !== activeIds.value[index])
    ) {
      activeIds.value = next;
    }
  }

  function scheduleUpdate() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      update();
    });
  }

  async function refresh() {
    if (!import.meta.client) return;

    await nextTick();
    observed = toValue(ids)
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    update();
  }

  onMounted(() => {
    void refresh();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
  });

  onBeforeUnmount(() => {
    observed = [];
    if (import.meta.client) {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId !== null) cancelAnimationFrame(rafId);
    }
  });

  watch(
    () => toValue(ids).join("|"),
    () => {
      void refresh();
    },
  );

  return {
    activeIds,
    refresh,
  };
}
