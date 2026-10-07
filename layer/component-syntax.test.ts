import { readFileSync, readdirSync } from "node:fs";
import {
  parseMdcBody,
  parseMdcDocument,
  projectMdcDocument,
  serializeMdcDocument,
  validatePublicMarkdownAst,
} from "@lupinum/ginko-content/cms-contract";
import { describe, expect, it } from "vitest";
import { contentComponentPolicy } from "./tags";

const contentRoot = new URL("../docs/content/", import.meta.url);
const pages = readdirSync(contentRoot, { recursive: true })
  .filter((path) => path.endsWith(".md"))
  .map((path) => [path, readFileSync(new URL(path, contentRoot), "utf8")] as const);

describe("canonical component source", () => {
  it.each(pages)("keeps %s in angle syntax, including copyable examples", async (_path, source) => {
    expect(source).not.toMatch(/(^|\n)\s*:{2,}(?:[a-z][\w-]*|\s*$)/m);
    expect(source).not.toMatch(/:kbd\[/);
    const { body } = await parseMdcBody(source.replace(/^---\n[\s\S]*?\n---\n/, ""), {
      autoClose: false,
    });
    expect(validatePublicMarkdownAst(body, contentComponentPolicy)).toEqual({
      ok: true,
      value: body,
    });
  });

  it("round-trips nested Markdown, named slots, typed props and self-closing tags", async () => {
    const source = `<Accordion type="multiple" :defaultValue='["first"]' collapsible>
<AccordionItem value="first">
<template #title>
A **rich** title
</template>
<template #content>
<Layout align="center">
<Column>
Press <Kbd>Enter</Kbd>.
</Column>
<Column>
<Figure src="/image.webp" alt="A flower" :zoom="false" :width="640" />
</Column>
</Layout>
</template>
</AccordionItem>
</Accordion>`;
    const document = await parseMdcDocument(source, { autoClose: false });
    const output = await serializeMdcDocument(document);
    const reparsed = await parseMdcDocument(output, { autoClose: false });
    expect(projectMdcDocument(reparsed)).toEqual(projectMdcDocument(document));
    expect(output).toContain("<template #title>");
    expect(output).toContain('<Figure src="/image.webp"');
    expect(output).not.toMatch(/^:{2,}/m);
    expect(document.nodes[0]?.[1]).toMatchObject({ defaultValue: ["first"], collapsible: true });
    const { body } = await parseMdcBody(output, { autoClose: false });
    expect(validatePublicMarkdownAst(body, contentComponentPolicy)).toEqual({
      ok: true,
      value: body,
    });
  });
});
