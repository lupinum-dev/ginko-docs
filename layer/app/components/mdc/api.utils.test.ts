import { describe, expect, it } from "vite-plus/test";
import {
  apiEntryId,
  normalizeApiGroups,
  parseApiSource,
  signatureTail,
  splitInlineCode,
} from "./api.utils";

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

  it("coerces string booleans and numeric values from inline props", () => {
    const groups = normalizeApiGroups([
      {
        label: "Flags",
        entries: [{ name: "--force", required: "true", default: false, since: 2.1 }],
      },
    ]);

    const entry = groups[0]?.entries[0];
    expect(entry?.required).toBe(true);
    expect(entry?.default).toBe("false");
    expect(entry?.since).toBe("2.1");
  });

  it("lets required win over optional", () => {
    const groups = normalizeApiGroups([
      { label: "Props", entries: [{ name: "src", optional: true, required: true }] },
    ]);

    expect(groups[0]?.entries[0]?.required).toBe(true);
    expect(groups[0]?.entries[0]?.optional).toBe(false);
  });

  it("drops groups without label or entries and entries without a name", () => {
    const groups = normalizeApiGroups([
      { label: "Props", entries: [{ annotation: "string" }, { name: "alt" }] },
      { label: "Empty", entries: [] },
      { entries: [{ name: "orphan" }] },
      "not a group",
      null,
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.entries.map((entry) => entry.name)).toEqual(["alt"]);
  });

  it("returns an empty list for non-array input", () => {
    expect(normalizeApiGroups(undefined)).toEqual([]);
    expect(normalizeApiGroups("groups")).toEqual([]);
    expect(normalizeApiGroups({ label: "Props" })).toEqual([]);
  });
});

describe("parseApiSource", () => {
  it("parses YAML with a top-level groups key", () => {
    const source = [
      "groups:",
      "  - label: Props",
      "    entries:",
      "      - name: src",
      "        annotation: string",
      "        required: true",
    ].join("\n");

    const groups = parseApiSource(source);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.entries[0]).toMatchObject({ name: "src", required: true });
  });

  it("parses a bare list of groups", () => {
    const source = ["- label: Flags", "  entries:", "    - name: --force"].join("\n");
    expect(parseApiSource(source)[0]?.label).toBe("Flags");
  });

  it("returns no groups for empty or invalid YAML", () => {
    expect(parseApiSource("")).toEqual([]);
    expect(parseApiSource("groups: [unclosed")).toEqual([]);
    expect(parseApiSource("just a string")).toEqual([]);
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
