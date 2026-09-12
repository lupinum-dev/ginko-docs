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
