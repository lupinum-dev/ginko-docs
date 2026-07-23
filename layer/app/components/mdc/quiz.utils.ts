export type QuizOption = { text: string; correct: boolean };
export type QuizType = "single" | "multiple";

export function parseQuizOptions(input: unknown, type: unknown): QuizOption[] {
  if (type !== "single" && type !== "multiple") {
    throw new TypeError('Quiz type must be "single" or "multiple"');
  }
  if (!Array.isArray(input) || input.length < 2) {
    throw new TypeError("Quiz options must contain at least two choices");
  }

  const labels = new Set<string>();
  const options = input.map((value, index): QuizOption => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError(`Quiz option ${index + 1} must be an object`);
    }
    const raw = value as Record<string, unknown>;
    if (typeof raw.text !== "string" || !raw.text.trim()) {
      throw new TypeError(`Quiz option ${index + 1} must have non-empty text`);
    }
    const text = raw.text.trim();
    if (labels.has(text)) throw new TypeError(`Quiz option text must be unique: "${text}"`);
    labels.add(text);
    if (typeof raw.correct !== "boolean") {
      throw new TypeError(`Quiz option ${index + 1}.correct must be a boolean`);
    }
    return { text, correct: raw.correct };
  });

  const correctCount = options.filter((option) => option.correct).length;
  if (type === "single" && correctCount !== 1) {
    throw new TypeError("A single-choice quiz must have exactly one correct option");
  }
  if (type === "multiple" && correctCount < 1) {
    throw new TypeError("A multiple-choice quiz must have at least one correct option");
  }
  return options;
}
