import { beforeEach, describe, expect, it, vi } from "vitest";

const registrations: Array<Record<string, unknown>> = [];
vi.mock("@nuxt/kit", () => ({
  addComponent: (registration: Record<string, unknown>) => registrations.push(registration),
  createResolver: () => ({ resolve: (path: string) => `/package/${path.replace(/^\.\//, "")}` }),
  defineNuxtModule: (definition: unknown) => definition,
}));

describe("component-only module", () => {
  beforeEach(() => registrations.splice(0));

  it("registers only the selected render components and their scoped stylesheet", async () => {
    const module = (await import("./component-kit")).default as {
      setup: (options: unknown, nuxt: { options: { css: string[] } }) => void;
    };
    const nuxt = { options: { css: [] as string[] } };
    module.setup({}, nuxt);

    expect(registrations.map(({ name }) => name)).toEqual([
      "MdcColumn",
      "MdcInfo",
      "MdcLayout",
      "MdcCallout",
    ]);
    expect(nuxt.options).toEqual({ css: ["/package/app/assets/css/component-kit.css"] });
    expect(Object.keys(nuxt.options)).toEqual(["css"]);
  });
});
