declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@nuxt/schema" {
  interface NuxtConfig {
    shadcn?: {
      prefix?: string;
      componentDir?: string;
    };
  }
}

declare module "@vueuse/core" {
  import type { App, Ref } from "vue";

  export function onClickOutside(
    target: unknown,
    handler: (event: PointerEvent) => void,
    options?: Record<string, unknown>,
  ): () => void;
  export function onKeyStroke(
    key: string | string[] | true,
    handler: (event: KeyboardEvent) => void,
    options?: Record<string, unknown>,
  ): () => void;
  export function reactiveOmit<T extends object, K extends keyof T>(
    object: T,
    ...keys: K[]
  ): Omit<T, K>;
  export function useLocalStorage<T>(key: string, initialValue: T): Ref<T>;
  export function useScrollLock(element: unknown, initialState?: boolean): Ref<boolean>;
  export function provideSSRWidth(width: number, app?: App): void;
}
