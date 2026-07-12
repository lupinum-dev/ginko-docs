import { describe, expect, it } from "vite-plus/test";
import {
  findDocsNavigationTrail,
  getDocsNavigationGroups,
  normalizeDocsNavigationItem,
  type DocsNavigationItem,
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

describe("docs navigation trails", () => {
  it("derives the full hierarchy from the canonical navigation tree", () => {
    expect(
      findDocsNavigationTrail(navigation, "/docs/guides/authentication/api-keys").map(
        (item) => item.title,
      ),
    ).toEqual(["Guides", "Authentication", "API keys"]);
  });

  it("returns an empty trail when the route is outside the docs tree", () => {
    expect(findDocsNavigationTrail(navigation, "/blog/release")).toEqual([]);
  });

  it("uses a group index as the heading target without duplicating it in the item list", () => {
    const section = normalizeDocsNavigationItem({
      title: "Essentials",
      path: "/docs/essentials",
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
    });

    expect(getDocsNavigationGroups(section)).toEqual([
      {
        id: "/docs/essentials:main",
        items: [expect.objectContaining({ path: "/docs/essentials" })],
      },
      {
        id: "/docs/essentials/content-rendering",
        title: "Content Rendering",
        path: "/docs/essentials/content-rendering",
        items: [expect.objectContaining({ title: "Component Tags" })],
      },
    ]);
  });

  it("keeps a structural group pathless while preserving its child pages", () => {
    const section = normalizeDocsNavigationItem({
      title: "Essentials",
      path: "/docs/essentials",
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
    });

    expect(getDocsNavigationGroups(section)).toContainEqual({
      id: "Operations",
      title: "Operations",
      path: undefined,
      icon: undefined,
      items: [
        expect.objectContaining({ title: "Deployment Checklist" }),
        expect.objectContaining({ title: "Troubleshooting" }),
      ],
    });
  });
});
