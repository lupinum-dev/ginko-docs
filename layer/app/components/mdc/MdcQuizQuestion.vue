<script setup lang="ts">
import type { Ref } from "vue";
import { h, inject, ref, computed, watch, useSlots } from "vue";
import { cn } from "../../utils";
import { Icon } from "#components";
import { useI18n } from "#imports";

type YamlOption = { text: string; correct?: boolean } | string;

const props = withDefaults(
  defineProps<{
    question: string;
    type?: "single" | "multiple";
    explanation?: string;
    options?: YamlOption[];
    checkLabel?: string;
    correctLabel?: string;
    incorrectLabel?: string;
    resetLabel?: string;
    multipleChoiceLabel?: string;
  }>(),
  {
    type: "single",
  },
);

const MDC_QUIZ = Symbol.for("mdc.quiz");
const quizContext = inject<{
  registerQuestion: () => number;
  markAnswered: (index: number, correct: boolean) => void;
  resetKey: Ref<number>;
  inQuiz: boolean;
} | null>(MDC_QUIZ, null);

const questionIndex = quizContext?.registerQuestion() ?? -1;

if (quizContext?.resetKey) {
  watch(quizContext.resetKey, () => {
    isSubmitted.value = false;
    selectedOptions.value = new Set();
  });
}

const slots = useSlots();
const selectedOptions = ref(new Set<number>());
const isSubmitted = ref(false);
const { locale } = useI18n();

const text = computed(() => {
  const isGerman = String(locale.value) === "de";

  return {
    check: props.checkLabel ?? (isGerman ? "Antwort pruefen" : "Check Answer"),
    correct: props.correctLabel ?? (isGerman ? "Richtig" : "Correct"),
    incorrect: props.incorrectLabel ?? (isGerman ? "Nicht richtig" : "Incorrect"),
    reset: props.resetLabel ?? (isGerman ? "Erneut versuchen" : "Try Again"),
    multipleChoice:
      props.multipleChoiceLabel ??
      (isGerman ? "(mehrere Antworten möglich)" : "(select all that apply)"),
  };
});

function normalizeYamlOption(opt: YamlOption): { text: string; correct: boolean } {
  if (typeof opt === "string") return { text: opt, correct: false };
  return { text: opt.text, correct: opt.correct ?? false };
}

const useYaml = computed(() => Array.isArray(props.options) && props.options.length > 0);

const isCorrect = computed(() => {
  return (props.options ?? []).every((opt, i) => {
    const { correct } = normalizeYamlOption(opt);
    return correct === selectedOptions.value.has(i);
  });
});

function handleSelect(index: number) {
  if (isSubmitted.value) return;
  if (props.type === "single") {
    selectedOptions.value = new Set([index]);
  } else {
    const next = new Set(selectedOptions.value);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    selectedOptions.value = next;
  }
}

function handleSubmit() {
  isSubmitted.value = true;
  quizContext?.markAnswered(questionIndex, isCorrect.value);
}

function handleReset() {
  isSubmitted.value = false;
  selectedOptions.value = new Set();
}

function renderButton(
  label: string,
  options: {
    disabled?: boolean;
    onClick: () => void;
    variant?: "outline" | "ghost";
  },
) {
  return h(
    "button",
    {
      type: "button",
      disabled: options.disabled,
      class: cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        options.variant === "ghost"
          ? "hover:bg-accent hover:text-accent-foreground"
          : "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      ),
      onClick: options.onClick,
    },
    label,
  );
}

function renderOptions() {
  return (props.options ?? []).map((opt, i) => {
    const { text: label, correct } = normalizeYamlOption(opt);
    const selected = selectedOptions.value.has(i);
    const state = isSubmitted.value
      ? correct
        ? "correct"
        : selected
          ? "incorrect"
          : "idle"
      : selected
        ? "selected"
        : "idle";
    const resultIcon =
      state === "correct"
        ? "lucide:circle-check"
        : state === "incorrect"
          ? "lucide:circle-x"
          : null;
    return h(
      "button",
      {
        key: i,
        type: "button",
        disabled: isSubmitted.value,
        class: "content-quiz-option",
        "data-state": state,
        onClick: () => handleSelect(i),
      },
      [
        h(
          "span",
          { class: "content-quiz-option-key", "aria-hidden": "true" },
          String.fromCharCode(65 + i),
        ),
        h("span", { class: "content-quiz-option-label" }, label),
        resultIcon
          ? h(Icon, { name: resultIcon, class: "content-quiz-option-result", ariaHidden: true })
          : null,
      ],
    );
  });
}

function renderQuestion() {
  return h("div", { class: quizContext?.inQuiz ? "space-y-4" : "not-prose my-6 space-y-4" }, [
    h("p", { class: "font-semibold text-foreground" }, [
      props.type === "multiple"
        ? h(
            "span",
            { class: "text-xs font-normal text-muted-foreground mr-2" },
            text.value.multipleChoice,
          )
        : null,
      props.question,
    ]),
    h("div", { class: "space-y-2" }, renderOptions()),
    h("div", { class: "flex items-center gap-3" }, [
      !isSubmitted.value
        ? renderButton(text.value.check, {
            disabled: selectedOptions.value.size === 0,
            onClick: handleSubmit,
          })
        : h("div", { class: "flex items-center gap-3" }, [
            h(
              "span",
              {
                class: cn(
                  "text-sm font-medium",
                  isCorrect.value ? "text-success" : "text-destructive",
                ),
              },
              isCorrect.value ? text.value.correct : text.value.incorrect,
            ),
            !quizContext?.inQuiz
              ? renderButton(text.value.reset, { variant: "ghost", onClick: handleReset })
              : null,
          ]),
    ]),
    isSubmitted.value && (props.explanation || useYaml.value)
      ? h(
          "div",
          {
            class: "content-quiz-explanation",
          },
          [
            h(Icon, {
              name: "lucide:info",
              class: "mt-0.5 size-4 shrink-0 text-info",
              ariaHidden: true,
            }),
            props.explanation
              ? h("span", props.explanation)
              : h("div", { class: "content-prose content-prose-trim" }, slots.default?.()),
          ],
        )
      : null,
  ]);
}
</script>

<template>
  <component :is="renderQuestion" />
</template>
