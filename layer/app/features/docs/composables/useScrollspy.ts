import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";

export function useScrollspy(ids: MaybeRefOrGetter<string[]>, offset = 112) {
  const activeId = ref("");
  let observed: HTMLElement[] = [];

  // Headings use `scroll-margin-top: 7rem` (= offset), so after an anchor jump
  // a heading sits at exactly `offset` — with sub-pixel layout it can land a
  // fraction below. The tolerance keeps that heading active instead of the
  // previous section.
  const tolerance = 8;

  function updateFromScroll() {
    const candidates = observed
      .map((element) => ({
        id: element.id,
        top: element.getBoundingClientRect().top,
      }))
      .filter((item) => item.top <= offset + tolerance)
      .sort((a, b) => b.top - a.top);

    activeId.value = candidates[0]?.id ?? observed[0]?.id ?? "";
  }

  async function refresh() {
    if (!import.meta.client) return;

    await nextTick();
    observed = toValue(ids)
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    updateFromScroll();
  }

  onMounted(() => {
    void refresh();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    observed = [];
    if (import.meta.client) {
      window.removeEventListener("scroll", updateFromScroll);
    }
  });

  watch(
    () => toValue(ids).join("|"),
    () => {
      void refresh();
    },
  );

  return {
    activeId,
    refresh,
  };
}
