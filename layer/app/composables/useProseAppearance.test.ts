import { describe, expect, it, vi } from "vite-plus/test";
import { ref } from "vue";

const config = {
  prose: {
    appearance: "quiet",
    components: { callout: "tint" },
  },
};

vi.mock("./useGinkoDocsConfig", () => ({ useGinkoDocsConfig: () => config }));

const { useProseAppearance } = await import("./useProseAppearance");

describe("useProseAppearance", () => {
  it("resolves instance, family, global, and fallback values in order", () => {
    const local = ref<string | undefined>("quiet");
    expect(useProseAppearance("callout", local).value).toBe("quiet");
    local.value = undefined;
    expect(useProseAppearance("callout", local).value).toBe("tint");
    expect(useProseAppearance("figure").value).toBe("quiet");

    config.prose.appearance = "invalid" as "quiet";
    expect(useProseAppearance("figure").value).toBe("quiet");
  });
});
