import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { generateFavicons } from "./runtime/generate-favicons.mjs";

describe("favicon generator", () => {
  it("creates the browser and Apple icon set from an SVG", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ginko-favicons-"));
    const source = join(directory, "source.svg");
    await writeFile(
      source,
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#00dc82"/></svg>',
    );

    await expect(generateFavicons({ source, outputDirectory: directory })).resolves.toEqual([
      "favicon.svg",
      "favicon-96x96.png",
      "apple-touch-icon.png",
      "favicon.ico",
    ]);

    await expect(sharp(join(directory, "favicon-96x96.png")).metadata()).resolves.toMatchObject({
      width: 96,
      height: 96,
    });
    await expect(sharp(join(directory, "apple-touch-icon.png")).metadata()).resolves.toMatchObject({
      width: 180,
      height: 180,
    });

    const ico = await readFile(join(directory, "favicon.ico"));
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
  });

  it("embeds a raster source in the generated SVG", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ginko-favicons-"));
    const source = join(directory, "source.png");
    await sharp({
      create: { width: 64, height: 64, channels: 4, background: "#00dc82" },
    })
      .png()
      .toFile(source);

    await generateFavicons({ source, outputDirectory: directory });

    await expect(readFile(join(directory, "favicon.svg"), "utf8")).resolves.toContain(
      "data:image/png;base64,",
    );
  });

  it("rejects a non-square source", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ginko-favicons-"));
    const source = join(directory, "source.svg");
    await writeFile(
      source,
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><rect width="80" height="40"/></svg>',
    );

    await expect(generateFavicons({ source, outputDirectory: directory })).rejects.toThrow(
      "The favicon source must be square",
    );
  });
});
