import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("package agent documentation", () => {
  it("rejects a starting-route inventory that no longer matches the entry", () => {
    const directory = mkdtempSync(join(tmpdir(), "ginko-docs-agent-docs-"));
    const packageRoot = join(directory, "package");
    const sourceRoot = join(directory, "source");
    mkdirSync(packageRoot);
    mkdirSync(sourceRoot);
    writeFileSync(
      join(packageRoot, "package.json"),
      JSON.stringify({
        name: "@lupinum/example",
        version: "1.0.0",
        exports: { "./agent-docs": "./dist/agent/AGENTS.md" },
      }),
    );
    for (const route of ["start", "other"]) {
      writeFileSync(
        join(sourceRoot, `${route}.md`),
        `---\ntitle: ${route}\nroute: /${route}\nurl: https://example.com/${route}\n---\n`,
      );
    }
    try {
      const helper = pathToFileURL(resolve("scripts/package-agent-docs.mjs")).href;
      const result = spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          `
        import { readFile, writeFile } from 'node:fs/promises';
        import { buildPackageAgentDocs, verifyPackageAgentDocs } from ${JSON.stringify(helper)};
        await buildPackageAgentDocs(${JSON.stringify({ packageRoot, sourceRoot, startRoutes: ["/start"] })});
        await verifyPackageAgentDocs(${JSON.stringify(packageRoot)});
        const path = ${JSON.stringify(join(packageRoot, "dist/agent/manifest.json"))};
        const manifest = JSON.parse(await readFile(path, 'utf8'));
        manifest.startRoutes = ['/other'];
        await writeFile(path, JSON.stringify(manifest));
        await verifyPackageAgentDocs(${JSON.stringify(packageRoot)});
      `,
        ],
        { encoding: "utf8" },
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("entry differs from its inventory");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects malformed canonical URLs", () => {
    const directory = mkdtempSync(join(tmpdir(), "ginko-docs-agent-docs-"));
    const packageRoot = join(directory, "package");
    const sourceRoot = join(directory, "source");
    mkdirSync(packageRoot);
    mkdirSync(sourceRoot);
    writeFileSync(
      join(packageRoot, "package.json"),
      JSON.stringify({
        name: "@lupinum/example",
        version: "1.0.0",
        exports: { "./agent-docs": "./dist/agent/AGENTS.md" },
      }),
    );
    writeFileSync(
      join(sourceRoot, "start.md"),
      "---\ntitle: Start\nroute: /start\nurl: https://\n---\n",
    );

    try {
      const helper = pathToFileURL(resolve("scripts/package-agent-docs.mjs")).href;
      const result = spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          `import { buildPackageAgentDocs } from ${JSON.stringify(helper)}; await buildPackageAgentDocs(${JSON.stringify({ packageRoot, sourceRoot, startRoutes: ["/start"] })})`,
        ],
        { encoding: "utf8" },
      );

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("canonical URL");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
