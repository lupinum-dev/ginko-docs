import { describe, expect, it } from "vite-plus/test";
import { getMarkdownTocLinks } from "./content";

describe("getMarkdownTocLinks", () => {
  it("returns links from a markdown root", () => {
    const links = [{ id: "intro", text: "Introduction", depth: 2 }];

    expect(
      getMarkdownTocLinks({
        type: "root",
        children: [],
        toc: { links },
      }),
    ).toBe(links);
  });

  it.each([null, "markdown", [], { toc: { links: [] } }, { type: "root", children: [] }])(
    "returns no links for a non-markdown body: %j",
    (body) => {
      expect(getMarkdownTocLinks(body)).toBeUndefined();
    },
  );
});
