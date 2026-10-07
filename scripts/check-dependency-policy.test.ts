import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import { checkDependencyPolicy } from "./check-dependency-policy.mjs";

const source = readFileSync(new URL("../pnpm-workspace.yaml", import.meta.url), "utf8");

describe("dev-only audit exceptions", () => {
  it("accepts the recorded exceptions before their expiry", () => {
    expect(checkDependencyPolicy(source, Date.parse("2026-10-07T00:00:00Z"))).toEqual([]);
  });

  it("fails every exception at its exact expiry", () => {
    const failures = checkDependencyPolicy(source, Date.parse("2026-11-06T00:00:00Z"));
    expect(failures.filter((failure) => failure.includes("expired"))).toHaveLength(5);
  });

  it("rejects package names, later deadlines and missing metadata", () => {
    const now = Date.parse("2026-10-07T00:00:00Z");
    expect(
      checkDependencyPolicy(source.replace("GHSA-86w9-cpqp-85rv", "node-forge"), now),
    ).toContain("Each audit exception must name one unique GHSA ID.");
    expect(checkDependencyPolicy(source.replaceAll("2026-11-06T", "2026-12-06T"), now)).toContain(
      "GHSA-86w9-cpqp-85rv: dev-only audit exception must expire by 2026-11-06.",
    );
    expect(
      checkDependencyPolicy(source.replace(/(GHSA-86w9-cpqp-85rv) # .*/, "$1"), now),
    ).toContain(
      "GHSA-86w9-cpqp-85rv: inline JSON comment must contain a nonempty reason, owner, and UTC expires.",
    );
  });
});
