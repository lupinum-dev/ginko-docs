import { describe, expect, it } from "vite-plus/test";
import { normalizeAppError } from "./errors";

describe("normalizeAppError", () => {
  it.each([
    [401, "accessDenied"],
    [403, "accessDenied"],
    [404, "notFound"],
    [500, "server"],
    [503, "server"],
    [429, "unavailable"],
  ] as const)("maps status %s to %s", (statusCode, kind) => {
    expect(normalizeAppError({ statusCode, message: "must not leak" })).toEqual({
      kind,
      statusCode,
    });
  });

  it("uses a safe server fallback for malformed errors", () => {
    expect(normalizeAppError(new Error("database credentials leaked"))).toEqual({
      kind: "server",
      statusCode: 500,
    });
  });
});
