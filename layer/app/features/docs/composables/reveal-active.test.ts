import { describe, expect, it } from "vite-plus/test";
import { computeRevealScrollTop } from "./useRevealActive";

const base = {
  scrollTop: 100,
  containerHeight: 400,
  activeHeight: 28,
  topPad: 8,
  bottomPad: 8,
};

describe("computeRevealScrollTop", () => {
  it("leaves elements inside the visible band alone", () => {
    expect(computeRevealScrollTop({ ...base, activeTop: 8 })).toBeNull();
    expect(computeRevealScrollTop({ ...base, activeTop: 200 })).toBeNull();
    expect(computeRevealScrollTop({ ...base, activeTop: 400 - 8 - 28 })).toBeNull();
  });

  it("centers elements above the band", () => {
    // activeTop 0 sits on the band edge; center it: 100 + 0 - 200 + 14
    expect(computeRevealScrollTop({ ...base, activeTop: 0 })).toBe(-86);
    expect(computeRevealScrollTop({ ...base, activeTop: -50 })).toBe(-136);
  });

  it("centers elements below the band", () => {
    expect(computeRevealScrollTop({ ...base, activeTop: 380 })).toBe(294);
  });

  it("respects asymmetric padding", () => {
    const pads = { ...base, topPad: 16, bottomPad: 44 };
    expect(computeRevealScrollTop({ ...pads, activeTop: 12 })).not.toBeNull();
    expect(computeRevealScrollTop({ ...pads, activeTop: 16 })).toBeNull();
    expect(computeRevealScrollTop({ ...pads, activeTop: 400 - 44 - 28 })).toBeNull();
    expect(computeRevealScrollTop({ ...pads, activeTop: 400 - 44 - 27 })).not.toBeNull();
  });
});
