import { describe, expect, test } from "vite-plus/test";
import {
  dedupeCommandCenterItems,
  groupCommandCenterItems,
  rememberRecentItem,
  resolveRecentItems,
  type CommandCenterItem,
} from "./command-center";

const fixtures: CommandCenterItem[] = [
  {
    id: "docs-navigation",
    title: "Navigation",
    subtitle: "Hierarchical documentation navigation",
    href: "/docs/essentials/navigation",
    group: "docs",
    keywords: ["sidebar tree", "hierarchy"],
  },
  {
    id: "docs-agents",
    title: "Agent interfaces",
    subtitle: "Markdown and MCP output",
    href: "/docs/essentials/platform-capabilities/agent-interfaces",
    group: "docs",
    keywords: ["llm", "mcp"],
  },
  {
    id: "page-home",
    title: "Home",
    href: "/",
    group: "pages",
  },
];

describe("command-center domain", () => {
  test.each([
    ["sidebar tree", "docs-navigation"],
    ["navigation", "docs-navigation"],
    ["mcp", "docs-agents"],
    ["agent interfaces", "docs-agents"],
  ])("ranks the expected bilingual result for %s", (query, expectedId) => {
    const groups = groupCommandCenterItems(fixtures, query, String);
    expect(groups.flatMap((group) => group.items)[0]?.id).toBe(expectedId);
  });

  test("deduplicates navigation and search hits by destination", () => {
    expect(
      dedupeCommandCenterItems([fixtures[0]!, { ...fixtures[0]!, id: "search-result-relaunch" }]),
    ).toEqual([fixtures[0]]);
  });

  test("resolves stored recent ids to the current canonical item", () => {
    const recent = resolveRecentItems(["docs-navigation"], fixtures);
    expect(recent[0]).toMatchObject({
      id: "recent-docs-navigation",
      sourceId: "docs-navigation",
      title: "Navigation",
      group: "recent",
    });
  });

  test("stores one most-recent copy of a selection", () => {
    const stored = rememberRecentItem(fixtures[0]!, ["page-home", "docs-navigation"]);
    expect(stored).toEqual(["docs-navigation", "page-home"]);
  });
});
