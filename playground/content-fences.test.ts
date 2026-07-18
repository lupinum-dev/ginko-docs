import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "comark";
import { describe, expect, it } from "vite-plus/test";

// Comark hoists unmatched component fence closers (`::`, `:::`, …) into the
// rendered output as literal text. Parse every content document and fail on
// any text node that is nothing but colons, so fence mismatches break CI
// instead of shipping as visible "::" artifacts on the page.

const contentRoot = join(process.cwd(), "playground/content");

function markdownFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) return markdownFiles(entryPath);
    return entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

type ComarkNode = string | [string, Record<string, unknown>, ...ComarkNode[]];

function fenceLeaks(nodes: ComarkNode[]): string[] {
  return nodes.flatMap((node) => {
    if (typeof node === "string") {
      return /^:{2,}[\s:]*$/.test(node.trim()) && node.trim() !== "" ? [node] : [];
    }
    return fenceLeaks(node.slice(2) as ComarkNode[]);
  });
}

describe("content fence integrity", () => {
  it("renders no unmatched component fences in any content document", async () => {
    const files = markdownFiles(contentRoot);
    expect(files.length).toBeGreaterThan(0);

    const leaks: string[] = [];
    for (const file of files) {
      const ast = await parse(readFileSync(file, "utf8"));
      for (const leak of fenceLeaks(ast.nodes as ComarkNode[])) {
        leaks.push(`${relative(contentRoot, file)}: ${JSON.stringify(leak)}`);
      }
    }

    expect(leaks).toEqual([]);
  });
});
