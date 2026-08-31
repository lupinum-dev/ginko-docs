#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ICO_SIZES = [16, 32, 48];

function createIco(images) {
  const headerSize = 6;
  const entrySize = 16;
  const directory = Buffer.alloc(headerSize + entrySize * images.length);

  directory.writeUInt16LE(0, 0);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(images.length, 4);

  let imageOffset = directory.length;
  images.forEach(({ size, data }, index) => {
    const entryOffset = headerSize + entrySize * index;
    directory.writeUInt8(size === 256 ? 0 : size, entryOffset);
    directory.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    directory.writeUInt8(0, entryOffset + 2);
    directory.writeUInt8(0, entryOffset + 3);
    directory.writeUInt16LE(1, entryOffset + 4);
    directory.writeUInt16LE(32, entryOffset + 6);
    directory.writeUInt32LE(data.length, entryOffset + 8);
    directory.writeUInt32LE(imageOffset, entryOffset + 12);
    imageOffset += data.length;
  });

  return Buffer.concat([directory, ...images.map(({ data }) => data)]);
}

async function renderSquare(source, size) {
  return sharp(source, { density: 512 }).resize(size, size, { fit: "contain" }).png().toBuffer();
}

function embeddedSvg(png) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img">
  <image width="512" height="512" href="data:image/png;base64,${png.toString("base64")}" />
</svg>
`;
}

export async function generateFavicons({ source, outputDirectory }) {
  const sourcePath = resolve(source);
  const outputPath = resolve(outputDirectory);
  const sourceBuffer = await readFile(sourcePath);
  const metadata = await sharp(sourceBuffer, { density: 512 }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read icon dimensions from ${sourcePath}`);
  }
  if (metadata.width !== metadata.height) {
    throw new Error(
      `The favicon source must be square. Received ${metadata.width}x${metadata.height}.`,
    );
  }

  const [png96, appleTouchIcon, ...icoPngs] = await Promise.all([
    renderSquare(sourceBuffer, 96),
    renderSquare(sourceBuffer, 180),
    ...ICO_SIZES.map(async (size) => ({ size, data: await renderSquare(sourceBuffer, size) })),
  ]);

  const svg =
    extname(sourcePath).toLowerCase() === ".svg"
      ? sourceBuffer
      : Buffer.from(embeddedSvg(await renderSquare(sourceBuffer, 512)));

  await mkdir(outputPath, { recursive: true });
  await Promise.all([
    writeFile(join(outputPath, "favicon.svg"), svg),
    writeFile(join(outputPath, "favicon-96x96.png"), png96),
    writeFile(join(outputPath, "apple-touch-icon.png"), appleTouchIcon),
    writeFile(join(outputPath, "favicon.ico"), createIco(icoPngs)),
  ]);

  return ["favicon.svg", "favicon-96x96.png", "apple-touch-icon.png", "favicon.ico"];
}

function parseArguments(arguments_) {
  const options = {
    source: "public/favicon.svg",
    outputDirectory: "public",
  };

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--source") options.source = arguments_[++index];
    else if (argument === "--out") options.outputDirectory = arguments_[++index];
    else if (argument === "--help" || argument === "-h") return undefined;
    else throw new Error(`Unknown argument: ${argument}`);
  }

  if (!options.source || !options.outputDirectory) {
    throw new Error("Both --source and --out require a path.");
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (!options) {
    console.log(`Usage: ginko-docs-favicons [--source <path>] [--out <directory>]

Defaults:
  --source public/favicon.svg
  --out public`);
    return;
  }

  const files = await generateFavicons(options);
  console.log(`Generated ${files.join(", ")} in ${resolve(options.outputDirectory)}`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
