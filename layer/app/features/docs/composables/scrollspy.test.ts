import { describe, expect, it } from "vite-plus/test";
import { computeActiveIds, type ScrollspyHeading, type ScrollspyZone } from "./useScrollspy";

const zone = (overrides: Partial<ScrollspyZone> = {}): ScrollspyZone => ({
  zoneTop: 112,
  zoneBottom: 640,
  docEnd: 4000,
  atBottom: false,
  ...overrides,
});

const headings = (...tops: number[]): ScrollspyHeading[] =>
  tops.map((top, index) => ({ id: `h${index + 1}`, top }));

describe("computeActiveIds", () => {
  it("returns nothing for an empty page", () => {
    expect(computeActiveIds([], zone())).toEqual([]);
  });

  it("marks every section intersecting the reading zone", () => {
    // h1 ends above the zone; h2 and h3 straddle it; h4 starts below it.
    expect(computeActiveIds(headings(-800, 100, 400, 900), zone())).toEqual(["h2", "h3"]);
  });

  it("activates a single spanning section between distant headings", () => {
    expect(computeActiveIds(headings(-500, 2000), zone())).toEqual(["h1"]);
  });

  it("falls back to the last heading crossed above the zone, with tolerance", () => {
    // All sections end above the zone except a long tail that has not started:
    // h2 sits a fraction below the zone top after an anchor jump.
    expect(computeActiveIds(headings(-300, 115), zone({ zoneBottom: 114 }))).toEqual(["h2"]);
  });

  it("falls back to the first heading when everything is below the zone", () => {
    expect(computeActiveIds(headings(700, 900), zone())).toEqual(["h1"]);
  });

  it("keeps the heading landed by an anchor jump as the first active entry", () => {
    // scroll-margin-top places the clicked heading at exactly the zone top;
    // the previous section must not stay active.
    expect(computeActiveIds(headings(-400, 112, 500), zone())).toEqual(["h2", "h3"]);
  });

  it("activates a short final section only at the page bottom", () => {
    const page = headings(-900, -400, 700);
    expect(computeActiveIds(page, zone({ docEnd: 760 }))).toEqual(["h2"]);
    expect(computeActiveIds(page, zone({ docEnd: 760, atBottom: true }))).toEqual(["h2", "h3"]);
  });

  it("handles a single-heading page", () => {
    expect(computeActiveIds(headings(300), zone())).toEqual(["h1"]);
  });
});
