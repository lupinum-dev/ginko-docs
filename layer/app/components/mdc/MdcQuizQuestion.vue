<script setup lang="ts">
import type { Ref, VNode } from "vue";
import { h, inject, ref, computed, watch, useSlots, resolveComponent } from "vue";
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
      (isGerman ? "(mehrere Antworten moeglich)" : "(select all that apply)"),
  };
});

function normalizeYamlOption(opt: YamlOption): { text: string; correct: boolean } {
  if (typeof opt === "string") return { text: opt, correct: false };
  return { text: opt.text, correct: opt.correct ?? false };
}

const useYaml = computed(() => Array.isArray(props.options) && props.options.length > 0);

function getOptionNodes(): VNode[] {
  return (slots.default?.() ?? []).filter((node): node is VNode => Boolean(node?.type));
}

const isCorrect = computed(() => {
  if (useYaml.value) {
    return props.options!.every((opt, i) => {
      const { correct } = normalizeYamlOption(opt);
      return correct === selectedOptions.value.has(i);
    });
  }
  const nodes = getOptionNodes();
  return nodes.every((node, i) => {
    const correct = node.props?.correct !== undefined && node.props?.correct !== false;
    const selected = selectedOptions.value.has(i);
    return correct === selected;
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
    () => label,
  );
}

function renderOptions() {
  if (useYaml.value) {
    const QuizOption = resolveComponent("MdcQuizOption");
    return props.options!.map((opt, i) => {
      const { text, correct } = normalizeYamlOption(opt);
      return h(QuizOption, {
        key: i,
        optionIndex: i,
        correct,
        label: text,
        selected: selectedOptions.value.has(i),
        disabled: isSubmitted.value,
        showResult: isSubmitted.value,
        onSelect: () => handleSelect(i),
      });
    });
  }
  return getOptionNodes().map((node, i) =>
    h(node, {
      key: i,
      optionIndex: i,
      selected: selectedOptions.value.has(i),
      disabled: isSubmitted.value,
      showResult: isSubmitted.value,
      onSelect: () => handleSelect(i),
    }),
  );
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
    isSubmitted.value && props.explanation
      ? h(
          "div",
          {
            class:
              "flex gap-2 rounded-lg border border-info/30 bg-info/10 px-4 py-3 text-sm text-foreground",
          },
          [
            h(Icon, {
              name: "lucide:info",
              class: "mt-0.5 size-4 shrink-0 text-info",
              ariaHidden: true,
            }),
            h("span", props.explanation),
          ],
        )
      : null,
  ]);
}
</script>

<template>
  <component :is="renderQuestion" />
</template>
