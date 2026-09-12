import { parse } from "@vue/compiler-sfc";
import { describe, expect, it } from "vitest";
import ts from "typescript";
import { literal, sourcePropOptions, sourceSlots } from "./generate-authoring-metadata.mjs";

describe("authoring metadata extraction", () => {
  it("only emits closed string literal unions", () => {
    expect(sourcePropOptions("type Tone = 'one' | 'two'; defineProps<{ tone?: Tone }>()")).toEqual({
      tone: ["one", "two"],
    });
    expect(sourcePropOptions("defineProps<{ appearance?: 'quiet' | string }>()")).toEqual({});
    expect(
      sourcePropOptions(
        "type Box<T> = { value: T }; defineProps<{ value?: Box<'one' | 'two'> }>()",
      ),
    ).toEqual({});
  });

  it("reads only real static slots from the Vue template AST", () => {
    const source = `<template><!-- <slot name="removed" /> --><slot /><slot name="actions" /><slot :name="activeSlot" /></template>`;
    const { descriptor, errors } = parse(source, { filename: "Fixture.vue" });
    expect(errors).toEqual([]);
    expect(sourceSlots(descriptor.template!.ast)).toEqual(["default", "actions"]);
  });

  it("keeps numeric and boolean defaults as their JSON primitive types", () => {
    const expression = (source: string) =>
      ts.createSourceFile(
        "default.ts",
        `const value = ${source}`,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      ).statements[0].declarationList.declarations[0].initializer!;
    expect(literal(expression("12"))).toBe(12);
    expect(literal(expression("true"))).toBe(true);
    expect(literal(expression("false"))).toBe(false);
  });
});
