import { describe, expect, it } from "vite-plus/test";
import { findNavigationTrail } from "@lupinum/ginko-content/navigation";
import {
  getDocsNavigationGroups,
  getDocsNavigationSections,
  docsNavigationSectionContainsPath,
  normalizeDocsNavigationItem,
  resolveDocsSectionTargetPath,
  type DocsNavigationItem,
  type DocsNavigationSection,
} from "./docs-navigation";

const navigation: DocsNavigationItem[] = [
  normalizeDocsNavigationItem({
    title: "Guides",
    path: "/docs/guides",
    children: [
      {
        title: "Authentication",
        children: [
          { title: "API keys", path: "/docs/guides/authentication/api-keys" },
          { title: "OAuth", path: "/docs/guides/authentication/oauth" },
        ],
      },
    ],
  }),
];

function collectPaths(item: DocsNavigationItem): string[] {
  return [
    ...(item.path ? [item.path] : []),
    ...item.children.flatMap((child) => collectPaths(child)),
  ];
}

describe("docs navigation trails", () => {
  it("derives the full hierarchy from the canonical navigation tree", () => {
    expect(
      findNavigationTrail(navigation, "/docs/guides/authentication/api-keys").map(
        (item) => item.title,
      ),
    ).toEqual(["Guides", "Authentication", "API keys"]);
  });

  it("returns an empty trail when the route is outside the docs tree", () => {
    expect(findNavigationTrail(navigation, "/blog/release")).toEqual([]);
  });

  it("matches active routes with or without a trailing slash", () => {
    expect(
      findNavigationTrail(navigation, "/docs/guides/authentication/api-keys/").map(
        (item) => item.title,
      ),
    ).toEqual(["Guides", "Authentication", "API keys"]);
  });

  it("keeps a navigable group index as the first item below its heading", () => {
    const [section] = getDocsNavigationSections([
      normalizeDocsNavigationItem({
        title: "Essentials",
        path: "/docs/essentials",
        sidebar: "section",
        children: [
          {
            title: "Content Rendering",
            path: "/docs/essentials/content-rendering",
            sidebar: "group",
            children: [
              {
                title: "Component Tags",
                path: "/docs/essentials/content-rendering/component-tags",
              },
            ],
          },
        ],
      }),
    ]);

    expect(getDocsNavigationGroups(section!)).toEqual([
      {
        id: "/docs/essentials:main",
        items: [expect.objectContaining({ path: "/docs/essentials" })],
      },
      {
        id: "/docs/essentials/content-rendering",
        title: "Content Rendering",
        icon: undefined,
        items: [
          expect.objectContaining({
            title: "Content Rendering",
            path: "/docs/essentials/content-rendering",
            children: [],
          }),
          expect.objectContaining({ title: "Component Tags" }),
        ],
      },
    ]);
  });

  it("keeps a structural group pathless while preserving its child pages", () => {
    const [section] = getDocsNavigationSections([
      normalizeDocsNavigationItem({
        title: "Essentials",
        path: "/docs/essentials",
        sidebar: "section",
        children: [
          {
            title: "Operations",
            sidebar: "group",
            children: [
              {
                title: "Deployment Checklist",
                path: "/docs/essentials/operations/deployment-checklist",
              },
              {
                title: "Troubleshooting",
                path: "/docs/essentials/operations/troubleshooting",
              },
            ],
          },
        ],
      }),
    ]);

    expect(getDocsNavigationGroups(section!)).toContainEqual({
      id: "docs:0.0:Operations",
      title: "Operations",
      icon: undefined,
      items: [
        expect.objectContaining({ title: "Deployment Checklist" }),
        expect.objectContaining({ title: "Troubleshooting" }),
      ],
    });
  });

  it("gives same-titled structural siblings distinct local identities", () => {
    const root = normalizeDocsNavigationItem({
      title: "Reference",
      children: [
        { title: "API", children: [{ title: "First", path: "/docs/first" }] },
        { title: "API", children: [{ title: "Second", path: "/docs/second" }] },
      ],
    });

    expect(root.children.map((item) => item.id)).toEqual(["docs:0.0:API", "docs:0.1:API"]);
  });

  it("partitions sibling folders at section markers without dropping any page", () => {
    const roots = [
      normalizeDocsNavigationItem({
        title: "Learn",
        sidebar: "section",
        children: [{ title: "Introduction", path: "/docs/overview/introduction" }],
      }),
      normalizeDocsNavigationItem({
        title: "Getting Started",
        children: [{ title: "Installation", path: "/docs/getting-started/installation" }],
      }),
      normalizeDocsNavigationItem({
        title: "Concepts",
        children: [{ title: "Identity", path: "/docs/concepts/identity" }],
      }),
      normalizeDocsNavigationItem({
        title: "API",
        sidebar: "section",
        children: [{ title: "Components", path: "/docs/api/components" }],
      }),
      normalizeDocsNavigationItem({
        title: "Project",
        children: [{ title: "Contributing", path: "/docs/project/contributing" }],
      }),
    ];

    const sections = getDocsNavigationSections(roots);
    expect(sections.map((section) => section.title)).toEqual(["Learn", "API"]);
    expect(sections[0]!.items.map((item) => item.title)).toEqual([
      "Introduction",
      "Getting Started",
      "Concepts",
    ]);
    expect(sections[1]!.items.map((item) => item.title)).toEqual(["Components", "Project"]);
    expect(docsNavigationSectionContainsPath(sections[0]!, "/docs/concepts/identity/")).toBe(true);
    expect(docsNavigationSectionContainsPath(sections[1]!, "/docs/concepts/identity")).toBe(false);

    const visiblePaths = sections.flatMap((section) =>
      getDocsNavigationGroups(section).flatMap((group) =>
        group.items.flatMap((item) => collectPaths(item)),
      ),
    );
    expect(visiblePaths).toEqual([
      "/docs/overview/introduction",
      "/docs/getting-started/installation",
      "/docs/concepts/identity",
      "/docs/api/components",
      "/docs/project/contributing",
    ]);
  });

  it("uses one unlabelled section when no marker is configured", () => {
    const sections = getDocsNavigationSections(navigation);
    expect(sections).toEqual([
      {
        id: "docs:main",
        items: navigation,
      },
    ]);
  });
});

describe("resolveDocsSectionTargetPath", () => {
  const section = (overrides: Partial<DocsNavigationSection>): DocsNavigationSection => ({
    id: "docs:section",
    items: [],
    ...overrides,
  });

  it("prefers the section's own page", () => {
    expect(resolveDocsSectionTargetPath(section({ path: "/docs/guides", items: navigation }))).toBe(
      "/docs/guides",
    );
  });

  it("resolves a structural section to its first navigable page", () => {
    const structural = section({
      items: [
        normalizeDocsNavigationItem({
          title: "Authentication",
          children: [{ title: "API keys", path: "/docs/guides/authentication/api-keys" }],
        }),
      ],
    });
    expect(resolveDocsSectionTargetPath(structural)).toBe("/docs/guides/authentication/api-keys");
  });

  it("returns undefined for a section without any page", () => {
    const empty = section({
      items: [normalizeDocsNavigationItem({ title: "Placeholder", children: [] })],
    });
    expect(resolveDocsSectionTargetPath(empty)).toBeUndefined();
  });
});
