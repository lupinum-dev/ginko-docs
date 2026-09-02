import { describe, expect, test } from "vite-plus/test";
import {
  dedupeCommandCenterItems,
  getSearchHighlightTerms,
  groupCommandCenterItems,
  rememberRecentItem,
  resolveRecentItems,
  shouldShowSearchResultBadges,
  type CommandCenterItem,
} from "./command-center";

const fixtures: CommandCenterItem[] = [
  {
    id: "docs-navigation",
    title: "Navigation",
    subtitle: "Hierarchical documentation navigation",
    href: "/docs/essentials/navigation",
    group: "docs_nav",
    keywords: ["sidebar tree", "hierarchy"],
  },
  {
    id: "docs-agents",
    title: "Agent interfaces",
    subtitle: "Markdown and MCP output",
    href: "/docs/essentials/platform-capabilities/agent-interfaces",
    group: "docs_nav",
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
  test("groups browse items without inventing a second search ranking", () => {
    const groups = groupCommandCenterItems(fixtures, String);
    expect(groups.map((group) => group.id)).toEqual(["docs_nav", "pages"]);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["docs-navigation", "docs-agents"]);
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

  test("highlights meaningful query terms instead of repeated stop words", () => {
    expect(getSearchHighlightTerms("never restarts the backdrop")).toEqual([
      "never",
      "restarts",
      "backdrop",
    ]);
    expect(getSearchHighlightTerms("the")).toEqual(["the"]);
  });

  test("shows result badges only when they distinguish result types", () => {
    expect(
      shouldShowSearchResultBadges([
        { ...fixtures[0]!, badge: "Documentation" },
        { ...fixtures[1]!, badge: "Documentation" },
      ]),
    ).toBe(false);
    expect(
      shouldShowSearchResultBadges([
        { ...fixtures[0]!, badge: "Documentation" },
        { ...fixtures[1]!, badge: "Blog" },
      ]),
    ).toBe(true);
  });
});
