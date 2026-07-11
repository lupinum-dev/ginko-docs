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
    id: "service-relaunch",
    title: "Website-Relaunch",
    subtitle: "Strategie, Design und Entwicklung für etablierte Unternehmen",
    href: "/leistungen/website-relaunch",
    group: "services",
    keywords: ["website neu machen", "relaunch"],
  },
  {
    id: "service-app",
    title: "Application development",
    subtitle: "Reliable custom web applications",
    href: "/services/application-development",
    group: "services",
    keywords: ["software", "web app"],
  },
  {
    id: "page-contact",
    title: "Kontakt",
    href: "/kontakt",
    group: "pages",
  },
];

describe("command-center domain", () => {
  test.each([
    ["website neu", "service-relaunch"],
    ["relaunch", "service-relaunch"],
    ["web app", "service-app"],
    ["application development", "service-app"],
  ])("ranks the expected bilingual result for %s", (query, expectedId) => {
    const groups = groupCommandCenterItems(fixtures, query, String);
    expect(groups.flatMap((group) => group.items)[0]?.id).toBe(expectedId);
  });

  test("deduplicates navigation and search hits by destination", () => {
    expect(
      dedupeCommandCenterItems([fixtures[0]!, { ...fixtures[0]!, id: "search-result-relaunch" }]),
    ).toEqual([fixtures[0]]);
  });

  test("normalizes legacy string recents and keeps the current canonical item", () => {
    const recent = resolveRecentItems(["service-relaunch"], fixtures);
    expect(recent[0]).toMatchObject({
      id: "recent-service-relaunch",
      sourceId: "service-relaunch",
      title: "Website-Relaunch",
      group: "recent",
    });
  });

  test("stores one most-recent copy of a selection", () => {
    const stored = rememberRecentItem(fixtures[0]!, ["page-contact", "service-relaunch"], fixtures);
    expect(stored.map((item) => (typeof item === "string" ? item : item.id))).toEqual([
      "service-relaunch",
      "page-contact",
    ]);
  });
});
