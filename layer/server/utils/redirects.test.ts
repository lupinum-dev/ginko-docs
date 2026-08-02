import { describe, expect, it } from "vite-plus/test";
import { buildRedirectMap, normalizeRedirectPath, themeStaticRoutes } from "./redirects.utils";

const doc = (resolvedPath: string, redirectFrom?: string[]) => ({
  route: { resolvedPath },
  redirectFrom,
});

describe("normalizeRedirectPath", () => {
  it("strips trailing slashes and query strings but keeps the root", () => {
    expect(normalizeRedirectPath("/docs/old/")).toBe("/docs/old");
    expect(normalizeRedirectPath("/docs/old?ref=1")).toBe("/docs/old");
    expect(normalizeRedirectPath("/")).toBe("/");
  });
});

describe("themeStaticRoutes", () => {
  it("covers home, docs, and blog roots for every locale", () => {
    expect(themeStaticRoutes()).toEqual(
      expect.arrayContaining(["/", "/docs", "/blog", "/de", "/de/dokumentation", "/de/blog"]),
    );
  });
});

describe("buildRedirectMap", () => {
  it("maps every source to its document's live path", () => {
    const map = buildRedirectMap([
      doc("/docs/setup", ["/docs/getting-started-old", "/docs/install/"]),
      doc("/de/dokumentation/einrichtung", ["/de/dokumentation/alte-einrichtung"]),
      doc("/docs/other"),
    ]);

    expect(map.get("/docs/getting-started-old")).toBe("/docs/setup");
    expect(map.get("/docs/install")).toBe("/docs/setup");
    expect(map.get("/de/dokumentation/alte-einrichtung")).toBe("/de/dokumentation/einrichtung");
    expect(map.size).toBe(3);
  });

  it("returns an empty map when nothing declares redirectFrom", () => {
    expect(buildRedirectMap([doc("/docs/a"), doc("/docs/b")]).size).toBe(0);
  });

  it("rejects a source that is also a live page", () => {
    expect(() => buildRedirectMap([doc("/docs/a", ["/docs/b"]), doc("/docs/b")])).toThrow(
      /also a live page/,
    );
  });

  it("rejects a source claimed by two different pages", () => {
    expect(() =>
      buildRedirectMap([doc("/docs/a", ["/docs/old"]), doc("/docs/b", ["/docs/old"])]),
    ).toThrow(/claimed by both/);
  });

  it("rejects a source that shadows a theme route", () => {
    expect(() => buildRedirectMap([doc("/docs/a", ["/de/dokumentation"])])).toThrow(/theme route/);
  });

  it("accepts the same source declared twice for the same target", () => {
    const map = buildRedirectMap([doc("/docs/a", ["/docs/old"]), doc("/docs/a", ["/docs/old"])]);
    expect(map.get("/docs/old")).toBe("/docs/a");
  });
});
