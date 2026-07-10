import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vite-plus/test";

const appRoot = process.cwd();

type AllowlistEntry = {
  owner: string;
  path: string;
  pattern: RegExp;
  reason: string;
  removalCondition: string;
};

const designAuditAllowlist: AllowlistEntry[] = [];

const auditedRoots = [
  "app/assets/css",
  "app/components",
  "app/features",
  "packages/content-components/src/runtime",
] as const;

const auditedExtensions = new Set([".css", ".ts", ".vue"]);

const bannedPatterns = [
  { name: "raw overlay color", pattern: /bg-black\/\d+/g },
  { name: "hard-coded white foreground", pattern: /text-white/g },
  { name: "raw code block hex", pattern: /#(?:fbfbfb|121215)\b/gi },
  {
    name: "raw semantic state utility",
    pattern: /\b(?:bg|text|border)-(?:emerald|sky|yellow|rose|red|green)-[^\s"'`]+/g,
  },
] as const;

const bannedLayoutPatterns = [
  { name: "oversized radius", pattern: /\brounded-3xl\b/g },
  { name: "heavy elevation", pattern: /\bshadow-(?:xl|2xl)\b/g },
  { name: "heavy hover elevation", pattern: /\bhover:shadow-md\b/g },
  { name: "hard-coded docs header offset", pattern: /\btop-14\b/g },
  {
    name: "hard-coded docs header calc",
    pattern: /h-\[calc\(100vh-3\.5rem\)\]/g,
  },
  { name: "hard-coded docs toc width", pattern: /\bw-64\b/g },
] as const;

const retiredDesignPatterns = [
  {
    name: "business helper class",
    pattern: /\bbusiness-(?:container|section(?:-hero)?|card(?:-interactive)?)\b/g,
  },
  { name: "legacy accordion class", pattern: /\.AccordionContent\b/g },
  { name: "legacy prose trim class", pattern: /\bprose-no-margin\b/g },
  {
    name: "unused global color token",
    pattern:
      /--(?:color-)?(?:overlay|overlay-foreground|link|link-foreground|sidebar(?:-[a-z-]+)?)\b/g,
  },
] as const;

function visitFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...visitFiles(entryPath));
      continue;
    }

    if ([...auditedExtensions].some((extension) => entry.name.endsWith(extension))) {
      files.push(entryPath);
    }
  }

  return files;
}

function isAllowlisted(path: string, match: string) {
  return designAuditAllowlist.some(
    (entry) => entry.path === path && new RegExp(entry.pattern).test(match),
  );
}

describe("design system source audit", () => {
  it("keeps raw state, overlay, and code colors out of design-owned files", () => {
    const failures: string[] = [];
    const files = auditedRoots.flatMap((root) => visitFiles(join(appRoot, root)));

    for (const file of files) {
      const path = relative(appRoot, file);
      const source = readFileSync(file, "utf8");

      for (const banned of bannedPatterns) {
        const matches = source.matchAll(banned.pattern);

        for (const match of matches) {
          const value = match[0];
          if (!isAllowlisted(path, value)) {
            failures.push(`${path}: ${banned.name}: ${value}`);
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("keeps radius, elevation, and docs layout magic values on the documented scale", () => {
    const failures: string[] = [];
    const files = auditedRoots.flatMap((root) => visitFiles(join(appRoot, root)));

    for (const file of files) {
      const path = relative(appRoot, file);
      const source = readFileSync(file, "utf8");

      for (const banned of bannedLayoutPatterns) {
        for (const match of source.matchAll(banned.pattern)) {
          failures.push(`${path}: ${banned.name}: ${match[0]}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("keeps retired helper classes and unused tokens out of design-owned files", () => {
    const failures: string[] = [];
    const files = auditedRoots.flatMap((root) => visitFiles(join(appRoot, root)));

    for (const file of files) {
      const path = relative(appRoot, file);
      const source = readFileSync(file, "utf8");

      for (const retired of retiredDesignPatterns) {
        for (const match of source.matchAll(retired.pattern)) {
          failures.push(`${path}: ${retired.name}: ${match[0]}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("documents every audit allowlist entry with an owner and removal condition", () => {
    for (const entry of designAuditAllowlist) {
      expect(entry.owner).toBeTruthy();
      expect(entry.path).toBeTruthy();
      expect(entry.reason).toBeTruthy();
      expect(entry.removalCondition).toBeTruthy();
    }
  });

  it("keeps modal sheets above global chrome", () => {
    const banner = readFileSync(join(appRoot, "app/components/site/SiteBanner.vue"), "utf8");
    const header = readFileSync(join(appRoot, "app/components/site/SiteHeader.vue"), "utf8");
    const sheetOverlay = readFileSync(
      join(appRoot, "app/components/ui/sheet/SheetOverlay.vue"),
      "utf8",
    );
    const sheetContent = readFileSync(
      join(appRoot, "app/components/ui/sheet/SheetContent.vue"),
      "utf8",
    );

    expect(banner).toContain("z-30");
    expect(header).toContain("z-50");
    expect(header).toContain("bottom-0 z-40");
    expect(sheetOverlay).toContain("z-[60]");
    expect(sheetContent).toContain("z-[70]");
  });

  it("keeps docs folder navigation split between link and expand control", () => {
    const sidebarItem = readFileSync(
      join(appRoot, "app/features/docs/components/DocsSidebarItem.vue"),
      "utf8",
    );

    expect(sidebarItem).toContain('data-slot="docs-sidebar-folder-link"');
    expect(sidebarItem).toContain('data-slot="docs-sidebar-folder-toggle"');
    expect(sidebarItem).toContain(':to="item.path"');
  });

  it("keeps docs section switchers as selectors instead of route links", () => {
    const switchers = [
      "app/features/docs/components/DocsSidebarTabs.vue",
      "app/features/docs/components/DocsSidebarList.vue",
      "app/features/docs/components/DocsSidebarDropdown.vue",
    ];

    for (const file of switchers) {
      const source = readFileSync(join(appRoot, file), "utf8");
      expect(source).not.toContain("<NuxtLink");
      expect(source).toContain("update:activeId");
    }
  });
});
