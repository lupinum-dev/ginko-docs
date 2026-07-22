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

type ComponentOpening = { appearance?: string; tag: string };

function authoredComponentOpenings(source: string): ComponentOpening[] {
  const openings: ComponentOpening[] = [];
  let closingFence: string | undefined;

  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (closingFence) {
      if (trimmed === closingFence) closingFence = undefined;
      continue;
    }

    const codeFence = trimmed.match(/^(`{3,}|~{3,})/);
    if (codeFence) {
      closingFence = codeFence[1];
      continue;
    }

    const component = trimmed.match(/^:{2,}([a-z][a-z0-9-]*)(?:\{([^}]*)\})?$/i);
    if (!component?.[1]) continue;
    const appearance = component[2]?.match(/\bappearance="(quiet|tint)"/)?.[1];
    openings.push({ tag: component[1], ...(appearance && { appearance }) });
  }

  return openings;
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

  it("keeps the bilingual component laboratory structurally equivalent", () => {
    const english = readFileSync(
      join(contentRoot, "en/1.docs/8.components/3.component-showcase.md"),
      "utf8",
    );
    const german = readFileSync(
      join(contentRoot, "de/1.dokumentation/8.komponenten/3.komponenten-showcase.md"),
      "utf8",
    );

    expect(authoredComponentOpenings(german)).toEqual(authoredComponentOpenings(english));
  });

  it("shows both appearances with controlled fixtures for every surface family", () => {
    const showcase = readFileSync(
      join(contentRoot, "en/1.docs/8.components/3.component-showcase.md"),
      "utf8",
    );
    const openings = authoredComponentOpenings(showcase);
    const pairedFamilies = [
      "note",
      "aside",
      "excerpt",
      "accordion",
      "cards",
      "read-more",
      "steps",
      "timeline",
      "tabs",
      "code-group",
      "collapse",
      "code-tree",
      "files",
      "api",
      "figure",
      "quiz",
    ];

    for (const tag of pairedFamilies) {
      const appearances = new Set(
        openings
          .filter((opening) => opening.tag === tag && opening.appearance)
          .map((opening) => opening.appearance),
      );
      expect(appearances, `${tag} must demonstrate quiet and tint`).toEqual(
        new Set(["quiet", "tint"]),
      );
    }
  });
});
