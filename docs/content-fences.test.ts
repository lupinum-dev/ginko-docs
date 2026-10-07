import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseMdcDocument } from "@lupinum/ginko-content/cms-contract";
import { describe, expect, it } from "vite-plus/test";
import { contentComponentPolicy, contentComponentTags } from "../layer/tags";

// Use the same Comark integration as production, including angle components.

const contentRoot = join(process.cwd(), "docs/content");

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

function apiDataIssues(nodes: ComarkNode[]): string[] {
  return nodes.flatMap((node) => {
    if (typeof node === "string") return [];
    const [tag, props, ...children] = node;
    const ownIssue =
      tag === "api" && !Array.isArray(props.groups) ? ["api without groups prop"] : [];
    return [...ownIssue, ...apiDataIssues(children)];
  });
}

function containsTag(node: ComarkNode, tag: string): boolean {
  if (typeof node === "string") return false;
  const [name, , ...children] = node;
  return name === tag || children.some((child) => containsTag(child, tag));
}

function componentContainsTag(node: ComarkNode, component: string, tag: string): boolean {
  if (typeof node === "string") return false;
  const [name, , ...children] = node;
  if (name === component) return children.some((child) => containsTag(child, tag));
  return children.some((child) => componentContainsTag(child, component, tag));
}

type ComponentOpening = { appearance?: string; tag: string };

async function authoredComponentOpenings(source: string): Promise<ComponentOpening[]> {
  const document = await parseMdcDocument(source, { autoClose: false });
  function walk(nodes: ComarkNode[]): ComponentOpening[] {
    return nodes.flatMap((node) => {
      if (typeof node === "string") return [];
      const [tag, props, ...children] = node;
      const own = props.$
        ? [{ tag, ...(typeof props.appearance === "string" && { appearance: props.appearance }) }]
        : [];
      return [...own, ...walk(children)];
    });
  }
  return walk(document.nodes as ComarkNode[]);
}

describe("content component integrity", () => {
  it("documents and renders every public component in both author references", async () => {
    for (const file of [
      "en/1.docs/8.components/1.mdc-components.md",
      "de/1.dokumentation/8.komponenten/1.mdc-komponenten.md",
    ]) {
      const source = readFileSync(join(contentRoot, file), "utf8");
      const ast = await parseMdcDocument(source);
      const sections = source.split(/^## /m).slice(1);

      for (const tag of Object.keys(contentComponentTags)) {
        expect(
          (ast.nodes as ComarkNode[]).some((node) => containsTag(node, tag)),
          `${file} must include a live ${tag} example`,
        ).toBe(true);
        const section = sections.find((part) =>
          new RegExp(`\\b${tag}\\b`).test(part.split("\n")[0]!),
        );
        expect(section, `${file} must explain ${tag}`).toBeDefined();

        const policy = Object.entries(contentComponentPolicy.components).find(
          ([name]) => name === tag,
        )?.[1];
        for (const prop of Object.keys(policy?.props ?? {})) {
          expect(
            section?.includes(`\`${prop}\``) || section?.includes(`\`${tag}.${prop}\``),
            `${file} must document ${tag}.${prop} in its component section`,
          ).toBe(true);
        }
      }
    }
  });

  it("renders no unmatched component fences in any content document", async () => {
    const files = markdownFiles(contentRoot);
    expect(files.length).toBeGreaterThan(0);

    const leaks: string[] = [];
    for (const file of files) {
      const ast = await parseMdcDocument(readFileSync(file, "utf8"));
      for (const leak of fenceLeaks(ast.nodes as ComarkNode[])) {
        leaks.push(`${relative(contentRoot, file)}: ${JSON.stringify(leak)}`);
      }
    }

    expect(leaks).toEqual([]);
  });

  it("authors API data as typed JSON props instead of a code-fence slot", async () => {
    const issues: string[] = [];
    for (const file of markdownFiles(contentRoot)) {
      const ast = await parseMdcDocument(readFileSync(file, "utf8"));
      for (const issue of apiDataIssues(ast.nodes as ComarkNode[])) {
        issues.push(`${relative(contentRoot, file)}: ${issue}`);
      }
    }

    expect(issues).toEqual([]);
  });

  it("keeps the bilingual component laboratory structurally equivalent", async () => {
    const english = readFileSync(
      join(contentRoot, "en/1.docs/8.components/3.component-showcase.md"),
      "utf8",
    );
    const german = readFileSync(
      join(contentRoot, "de/1.dokumentation/8.komponenten/3.komponenten-showcase.md"),
      "utf8",
    );

    expect(await authoredComponentOpenings(german)).toEqual(
      await authoredComponentOpenings(english),
    );
  });

  it("keeps Markdown images inside heading-based steps", async () => {
    for (const file of [
      "en/1.docs/8.components/3.component-showcase.md",
      "de/1.dokumentation/8.komponenten/3.komponenten-showcase.md",
    ]) {
      const ast = await parseMdcDocument(readFileSync(join(contentRoot, file), "utf8"));
      expect(
        (ast.nodes as ComarkNode[]).some((node) => componentContainsTag(node, "steps", "img")),
        `${file} must render a Markdown image inside a step`,
      ).toBe(true);
    }
  });

  it("shows both appearances with controlled fixtures for every surface family", async () => {
    const showcase = readFileSync(
      join(contentRoot, "en/1.docs/8.components/3.component-showcase.md"),
      "utf8",
    );
    const openings = await authoredComponentOpenings(showcase);
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
