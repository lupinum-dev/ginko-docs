import { readonly } from "vue";
import { useCommandCenterState } from "#ginko-docs/features/search/useCommandCenter";

/** Public entry to the one search dialog. Hosts call open() from their own header. */
export function useDocsSearch() {
  const { open, openCommandCenter, closeCommandCenter } = useCommandCenterState();
  return {
    isOpen: readonly(open),
    open: (query?: string) => openCommandCenter(query ?? ""),
    close: closeCommandCenter,
  };
}
