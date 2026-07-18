import type { ComputedRef, InjectionKey } from "vue";
import type { FlatTocItem } from "#ginko-docs/utils/content";

/** Current page TOC, provided by the docs page shell so in-content components
 * (e.g. the `::toc` inline table of contents) can render it. */
export const docsTocKey: InjectionKey<ComputedRef<FlatTocItem[]>> = Symbol("ginko-docs-toc");
