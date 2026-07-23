import { describe, expect, it } from "vite-plus/test";
import { parseQuizOptions } from "./quiz.utils";

describe("parseQuizOptions", () => {
  it("accepts explicit single- and multiple-choice answers", () => {
    expect(
      parseQuizOptions(
        [
          { text: "A", correct: true },
          { text: "B", correct: false },
        ],
        "single",
      ),
    ).toEqual([
      { text: "A", correct: true },
      { text: "B", correct: false },
    ]);
    expect(
      parseQuizOptions(
        [
          { text: "A", correct: true },
          { text: "B", correct: true },
        ],
        "multiple",
      ),
    ).toHaveLength(2);
  });

  it.each([
    [undefined, "single"],
    [[], "single"],
    [[{ text: "A", correct: true }], "single"],
    [["A", "B"], "single"],
    [
      [
        { text: "A", correct: true },
        { text: "A", correct: false },
      ],
      "single",
    ],
    [
      [
        { text: "A", correct: false },
        { text: "B", correct: false },
      ],
      "single",
    ],
    [
      [
        { text: "A", correct: true },
        { text: "B", correct: true },
      ],
      "single",
    ],
    [
      [
        { text: "A", correct: false },
        { text: "B", correct: false },
      ],
      "multiple",
    ],
    [
      [
        { text: "A", correct: true },
        { text: "B", correct: false },
      ],
      "unknown",
    ],
  ] as const)("rejects an invalid quiz contract %#", (options, type) => {
    expect(() => parseQuizOptions(options, type)).toThrow();
  });
});
