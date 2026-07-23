import { describe, expect, it } from "vite-plus/test";
import { apiEntryId, normalizeApiGroups, signatureTail, splitInlineCode } from "./api.utils";

describe("normalizeApiGroups", () => {
  it("normalizes a valid YAML groups structure", () => {
    const groups = normalizeApiGroups([
      {
        label: "Props",
        entries: [
          { name: "src", annotation: "string", required: true, description: "Image source." },
          { name: "size", annotation: '"sm" | "md"', optional: true, default: '"md"' },
        ],
      },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Props");
    expect(groups[0]?.entries.map((entry) => entry.name)).toEqual(["src", "size"]);
    expect(groups[0]?.entries[0]?.required).toBe(true);
    expect(groups[0]?.entries[1]?.default).toBe('"md"');
  });

  it.each([
    undefined,
    [],
    "groups",
    [{ label: "", entries: [{ name: "src" }] }],
    [{ label: "Props", entries: [] }],
    [{ label: "Props", entries: [{ annotation: "string" }] }],
    [{ label: "Props", entries: [{ name: "src", required: "true" }] }],
    [{ label: "Props", entries: [{ name: "src", required: true, optional: true }] }],
    [{ label: "Props", entries: [{ name: "src" }, { name: "src" }] }],
    [
      { label: "Response 200", entries: [{ name: "value" }] },
      { label: "Response-200", entries: [{ name: "value" }] },
    ],
  ])("rejects malformed authored groups %#", (input) => {
    expect(() => normalizeApiGroups(input)).toThrow("Invalid API groups:");
  });
});

describe("signatureTail", () => {
  it("builds ? + annotation + default mechanically", () => {
    expect(
      signatureTail({ name: "size", optional: true, annotation: '"sm" | "md"', default: '"md"' }),
    ).toBe('?: "sm" | "md" = "md"');
    expect(signatureTail({ name: "src", annotation: "string" })).toBe(": string");
    expect(signatureTail({ name: "caption" })).toBe("");
    expect(signatureTail({ name: "zoom", optional: true })).toBe("?");
  });
});

describe("apiEntryId", () => {
  it("slugifies group label and entry name", () => {
    expect(apiEntryId("Props", "size")).toBe("api-props-size");
    expect(apiEntryId("Flags", "--pm")).toBe("api-flags-pm");
    expect(apiEntryId("Response 200", "receivedAt")).toBe("api-response-200-receivedat");
  });
});

describe("splitInlineCode", () => {
  it("returns plain text untouched", () => {
    expect(splitInlineCode("Plain sentence.")).toEqual([{ code: false, text: "Plain sentence." }]);
  });

  it("extracts backtick pairs as code parts", () => {
    expect(splitInlineCode("Use `size` instead of `width`.")).toEqual([
      { code: false, text: "Use " },
      { code: true, text: "size" },
      { code: false, text: " instead of " },
      { code: true, text: "width" },
      { code: false, text: "." },
    ]);
  });

  it("keeps an unmatched backtick literal", () => {
    expect(splitInlineCode("A stray ` backtick")).toEqual([
      { code: false, text: "A stray ` backtick" },
    ]);
  });
});
