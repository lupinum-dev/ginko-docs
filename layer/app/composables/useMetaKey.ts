import { onMounted, ref, type Ref } from "vue";

/**
 * Platform-aware modifier key label. Defaults to "Ctrl" during SSR and
 * upgrades to "⌘" on Apple platforms after mount (onMounted is client-only,
 * so hydration stays consistent).
 */
export function useMetaKey(): Ref<string> {
  const metaSymbol = ref("Ctrl");

  onMounted(() => {
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("Macintosh")) {
      metaSymbol.value = "⌘";
    }
  });

  return metaSymbol;
}
