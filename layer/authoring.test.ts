import {
  assertPortableComponentPolicyV2,
  parseMdcBody,
  validatePublicMarkdownAst,
} from "@lupinum/ginko-content/cms-contract";
import { describe, expect, it } from "vitest";
import { componentImplementationByName } from "./authoring.generated";
import { ginkoDocsAuthoringKitSource } from "./authoring";
import { contentComponentPolicy, contentComponentTags } from "./tags";

describe("Docs authoring kit", () => {
  it("derives implementation and policy from the canonical component authorities", () => {
    expect(assertPortableComponentPolicyV2(ginkoDocsAuthoringKitSource.policy)).toBe(
      ginkoDocsAuthoringKitSource.policy,
    );
    expect(ginkoDocsAuthoringKitSource.implementation.info).toBe(
      componentImplementationByName[contentComponentTags.info],
    );
    expect(ginkoDocsAuthoringKitSource.policy.components.layout).toBe(
      contentComponentPolicy.components.layout,
    );
    expect(componentImplementationByName.MdcLayout.props.type.types).toEqual(["string", "object"]);
    expect(componentImplementationByName.MdcInfo.props.class.types).toEqual(["complex"]);
    expect(() => JSON.stringify(ginkoDocsAuthoringKitSource)).not.toThrow();
  });

  it("uses Content policy for literal choices and layout nesting", async () => {
    const { body } = await parseMdcBody(
      '<layout type="border"><info appearance="invalid">Wrong child.</info></layout>',
      { autoClose: false },
    );
    expect(validatePublicMarkdownAst(body, ginkoDocsAuthoringKitSource.policy)).toMatchObject({
      ok: false,
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "invalid_prop_value" }),
        expect.objectContaining({ code: "invalid_nesting" }),
      ]),
    });
  });

  it("keeps each layout preset complementary and consistent with rendered proportions", () => {
    const columns = ginkoDocsAuthoringKitSource.authoring.layout.canvas.columns;
    const sizes = { sm: 1 / 3, md: 1 / 2, lg: 2 / 3 };
    for (const preset of columns.presets) {
      expect(sizes[preset.values[0]] + sizes[preset.values[1]]).toBeCloseTo(1);
      expect(preset.ratio).toBeCloseTo(sizes[preset.values[0]]);
    }
    expect(columns.presets.map(({ values }) => values.join("/"))).toEqual([
      "sm/lg",
      "md/md",
      "lg/sm",
    ]);
  });

  it("provides distinct callouts and visible titles without renaming stored props", async () => {
    for (const tag of ["info", "note", "warning", "error", "success", "idea"] as const) {
      expect(ginkoDocsAuthoringKitSource.authoring[tag].canvas.titleProp).toBe("title");
      expect(ginkoDocsAuthoringKitSource.implementation[tag].props.title.types).toEqual(["string"]);
      const recipe = ginkoDocsAuthoringKitSource.recipes.find(
        ({ id }) => id === (tag === "info" ? "information" : tag),
      );
      expect(recipe?.source).toContain(`<${tag} `);
    }
    expect(ginkoDocsAuthoringKitSource.authoring.aside.canvas.titleProp).toBe("label");
    expect(ginkoDocsAuthoringKitSource.authoring.excerpt.canvas.titleProp).toBe("label");
  });

  it("switches callout intent without changing the shared title and body contract", () => {
    const tones = {
      info: "info",
      note: "neutral",
      warning: "warning",
      error: "danger",
      success: "success",
      idea: "idea",
    } as const;
    for (const tag of Object.keys(tones) as (keyof typeof tones)[]) {
      const authoring = ginkoDocsAuthoringKitSource.authoring[tag];
      const component = ginkoDocsAuthoringKitSource.policy.components[tag];
      expect(authoring.canvas.switchGroup).toBe("callout");
      expect(authoring.canvas.tone).toBe(tones[tag]);
      expect(component.slots).toEqual(["default"]);
      expect(component.props.title).toEqual(
        ginkoDocsAuthoringKitSource.policy.components.info.props.title,
      );
      expect(component.props.icon).toEqual(
        ginkoDocsAuthoringKitSource.policy.components.info.props.icon,
      );
    }
  });

  it("parses each angle-source recipe once with the canonical Content engine", async () => {
    for (const recipe of ginkoDocsAuthoringKitSource.recipes) {
      const { body } = await parseMdcBody(recipe.source, { autoClose: false });
      expect(validatePublicMarkdownAst(body, ginkoDocsAuthoringKitSource.policy)).toEqual({
        ok: true,
        value: body,
      });
    }
  });
});
