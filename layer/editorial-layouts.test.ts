import { readFileSync } from "node:fs";
import { parseMdcBody, validatePublicMarkdownAst } from "@lupinum/ginko-content/cms-contract";
import { describe, expect, it } from "vitest";
import { contentComponentPolicy } from "./tags";

describe("editorial compositions", () => {
  it.each([
    "de/1.dokumentation/8.komponenten/5.magazin-layouts.md",
    "en/1.docs/8.components/5.magazine-layouts.md",
  ])("accepts the complete %s page with its nested components and slots", async (path) => {
    const source = readFileSync(new URL(`../docs/content/${path}`, import.meta.url), "utf8");
    const { body } = await parseMdcBody(source.replace(/^---\n[\s\S]*?\n---\n/, ""), {
      autoClose: false,
    });
    expect(validatePublicMarkdownAst(body, contentComponentPolicy)).toEqual({
      ok: true,
      value: body,
    });
  });

  it("rejects arbitrary CSS values in the editorial controls", async () => {
    const { body } = await parseMdcBody(
      `<Flow width="100vw">
<Figure src="/image.webp" alt="Example" placement="absolute" focus="42%" frame="shadow" />
</Flow>`,
      { autoClose: false },
    );
    const result = validatePublicMarkdownAst(body, contentComponentPolicy);
    expect(result.ok).toBe(false);
    expect(result.issues.filter(({ code }) => code === "invalid_prop_value")).toHaveLength(4);
  });
});
