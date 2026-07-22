import { useReducedMotion } from "motion-v";
import { computed } from "vue";

export const imageZoomTransition = {
  type: "spring",
  bounce: 0,
  duration: 0.42,
  ease: "easeInOut",
} as const;

const imageZoomFadeTransition = { duration: 0.16, ease: "easeOut" } as const;
const noMotionTransition = { duration: 0 } as const;

export function useImageZoomMotion() {
  const reducedMotion = useReducedMotion();

  return {
    imageTransition: computed(() =>
      reducedMotion.value ? noMotionTransition : imageZoomTransition,
    ),
    fadeTransition: computed(() =>
      reducedMotion.value ? noMotionTransition : imageZoomFadeTransition,
    ),
  };
}
