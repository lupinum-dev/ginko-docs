import type { Ref } from "vue";

export interface RevealActiveOptions {
  /** Band padding in px; the active element is left alone inside the band. */
  topPad?: number;
  bottomPad?: number;
}

export interface RevealMetrics {
  scrollTop: number;
  containerHeight: number;
  /** Active element's offset from the container's visible top edge. */
  activeTop: number;
  activeHeight: number;
  topPad: number;
  bottomPad: number;
}

/** Returns the scrollTop that centers the active element, or null if it is
 * already inside the visible band. */
export function computeRevealScrollTop(metrics: RevealMetrics): number | null {
  const { scrollTop, containerHeight, activeTop, activeHeight, topPad, bottomPad } = metrics;
  const visible = activeTop >= topPad && activeTop + activeHeight <= containerHeight - bottomPad;
  if (visible) return null;
  return scrollTop + activeTop - containerHeight / 2 + activeHeight / 2;
}

/**
 * Keeps the active element of an overflowing container visible by centering
 * it when it drifts outside the visible band. Scrolling is instant on
 * purpose: this is positioning, not motion, and must not compete with the
 * page scroll. Callers decide when to schedule `reveal` (nextTick, rAF, …).
 */
export function useRevealActive(
  container: Ref<HTMLElement | null> | (() => HTMLElement | null | undefined),
  selector: string,
  options: RevealActiveOptions = {},
) {
  function reveal() {
    const el = typeof container === "function" ? container() : container.value;
    if (!el || el.scrollHeight <= el.clientHeight) return;
    const active = el.querySelector<HTMLElement>(selector);
    if (!active) return;
    const containerRect = el.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const next = computeRevealScrollTop({
      scrollTop: el.scrollTop,
      containerHeight: el.clientHeight,
      activeTop: activeRect.top - containerRect.top,
      activeHeight: activeRect.height,
      topPad: options.topPad ?? 8,
      bottomPad: options.bottomPad ?? 8,
    });
    if (next !== null) el.scrollTop = next;
  }

  return { reveal };
}
