import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { siteConfig } from "./site.config";

const root = process.cwd();

function readAppFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function readCollectionBlock(source: string, name: string) {
  const start = source.indexOf(`export const ${name} = defineCollection({`);
  expect(start).toBeGreaterThanOrEqual(0);

  const nextCollection = source.indexOf("\nexport const ", start + 1);
  const defaultExport = source.indexOf("\nexport default", start + 1);
  const end = nextCollection === -1 ? defaultExport : nextCollection;

  return source.slice(start, end === -1 ? source.length : end);
}

describe("agent readiness", () => {
  it("keeps the public agent policy in the validated business config", () => {
    expect(siteConfig.agent).toMatchObject({
      profile: "business-site",
      contentSignals: {
        search: true,
        aiInput: true,
        aiTrain: false,
      },
      markdown: {
        metadata: {
          enabled: true,
          defaultFields: [
            "title",
            "description",
            "url",
            "route",
            "locale",
            "section",
            "collection",
            "source",
            "updated",
          ],
        },
      },
      skills: {
        enabled: false,
      },
    });
  });

  it("marks public page collections for markdown exposure only where useful", () => {
    const contentConfig = readAppFile("content.config.ts");

    for (const collection of ["docs", "blog", "services", "references", "legal"]) {
      const block = readCollectionBlock(contentConfig, collection);

      expect(block, `${collection} collection`).toContain("agent:");
      expect(block, `${collection} collection`).toContain("markdown:");
    }

    const authors = readCollectionBlock(contentConfig, "authors");
    expect(authors).toContain('type: "data"');
    expect(authors).toContain("bio: z.string()");
    expect(authors).toContain("avatar: z.string()");
    expect(authors).not.toContain("agent:");

    for (const collection of ["testimonials", "faqs"]) {
      expect(
        readCollectionBlock(contentConfig, collection),
        `${collection} data collection`,
      ).not.toContain("agent:");
    }
  });

  it("keeps agent discovery and markdown generation configured in Ginko", () => {
    const nuxtConfig = readAppFile("nuxt.config.ts");
    const contentConfig = readAppFile("content.config.ts");

    expect(nuxtConfig).toContain("agent: {");
    expect(nuxtConfig).toContain("markdownNegotiation: true");
    expect(nuxtConfig).toContain("linkHeaders: true");
    expect(nuxtConfig).toContain("prerender: true");
    expect(contentConfig).toContain("defineAgentSection");
    expect(contentConfig).toContain("defineAgentAppPage");
    expect(contentConfig).toContain("contentSignals: siteConfig.agent.contentSignals");
  });
});
