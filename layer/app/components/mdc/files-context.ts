import type { ComputedRef, InjectionKey } from "vue";

/** Slash-joined path of the enclosing folders inside a `::files` tree. */
export const filesParentPathKey: InjectionKey<ComputedRef<string>> = Symbol("ginko-files-path");

/** Path the `::files` root wants highlighted, e.g. "app/app.config.ts". */
export const filesHighlightKey: InjectionKey<ComputedRef<string | undefined>> =
  Symbol("ginko-files-highlight");
