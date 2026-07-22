<script setup lang="ts">
import type { VNode } from "vue";
import { cloneVNode, h, provide, reactive, ref, computed, useSlots } from "vue";
import { Icon } from "#components";
import { useI18n } from "#imports";
import { cn } from "../../utils";
import { useProseAppearance } from "../../composables/useProseAppearance";

const props = defineProps<{
  title?: string;
  description?: string;
  questionLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  resultsLabel?: string;
  correctSummaryLabel?: string;
  perfectLabel?: string;
  retryPrompt?: string;
  resetLabel?: string;
  appearance?: "quiet" | "tint";
}>();
const appearance = useProseAppearance("quiz", () => props.appearance);

const MDC_QUIZ = Symbol.for("mdc.quiz");

const slots = useSlots();
const activeIndex = ref(0);
const showResults = ref(false);
const resetKey = ref(0);

const state = reactive({
  totalQuestions: 0,
  answers: new Map<number, boolean>(),
});

function registerQuestion(): number {
  const index = state.totalQuestions;
  state.totalQuestions++;
  return index;
}

function markAnswered(index: number, correct: boolean) {
  state.answers.set(index, correct);
  setTimeout(() => {
    if (showResults.value) return;
    for (let i = index + 1; i < state.totalQuestions; i++) {
      if (!state.answers.has(i)) {
        activeIndex.value = i;
        return;
      }
    }
  }, 1200);
}

function reset() {
  state.answers.clear();
  activeIndex.value = 0;
  showResults.value = false;
  resetKey.value++;
}

provide(MDC_QUIZ, { registerQuestion, markAnswered, resetKey, inQuiz: true });

const correctCount = computed(() => [...state.answers.values()].filter(Boolean).length);
const currentAnswered = computed(() => state.answers.has(activeIndex.value));
const { locale } = useI18n();

const text = computed(() => {
  const isGerman = String(locale.value) === "de";

  return {
    question: props.questionLabel ?? (isGerman ? "Frage" : "Question"),
    of: isGerman ? "von" : "of",
    back: props.backLabel ?? (isGerman ? "Zurück" : "Back"),
    next: props.nextLabel ?? (isGerman ? "Weiter" : "Next"),
    results: props.resultsLabel ?? (isGerman ? "Ergebnis anzeigen" : "See Results"),
    correct: props.correctSummaryLabel ?? (isGerman ? "richtig" : "correct"),
    perfect: props.perfectLabel ?? (isGerman ? "Alles richtig." : "Perfect score!"),
    retryPrompt:
      props.retryPrompt ??
      (isGerman ? "Weiterlernen und erneut versuchen." : "Keep learning and try again."),
    reset: props.resetLabel ?? (isGerman ? "Erneut versuchen" : "Try Again"),
  };
});

function getQuestionNodes(): VNode[] {
  return (slots.default?.() ?? []).filter((node): node is VNode => Boolean(node?.type));
}

function renderButton(
  children: string | Array<string | VNode>,
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
      class: cn("content-quiz-button", options.variant === "ghost" && "content-quiz-button-ghost"),
      onClick: options.onClick,
    },
    children,
  );
}

function renderHeader() {
  return h("div", { class: "content-quiz-header" }, [
    h(Icon, { name: "lucide:circle-help", class: "content-quiz-header-icon", ariaHidden: true }),
    h("div", { class: "content-quiz-heading" }, [
      props.title ? h("div", { class: "content-quiz-title" }, props.title) : null,
      props.description ? h("div", { class: "content-quiz-description" }, props.description) : null,
    ]),
  ]);
}

function renderDots() {
  return h(
    "div",
    { class: "content-quiz-dots" },
    Array.from({ length: state.totalQuestions }, (_, i) =>
      h("button", {
        type: "button",
        class: "content-quiz-dot",
        "data-state":
          i === activeIndex.value ? "active" : state.answers.has(i) ? "answered" : undefined,
        "aria-label": `${text.value.question} ${i + 1}`,
        "aria-current": i === activeIndex.value ? "true" : undefined,
        onClick: () => {
          activeIndex.value = i;
        },
      }),
    ),
  );
}

function renderFooter() {
  const isLast = activeIndex.value === state.totalQuestions - 1;

  return h("div", { class: "content-quiz-footer" }, [
    h(
      "span",
      { class: "content-quiz-progress" },
      `${text.value.question} ${activeIndex.value + 1} ${text.value.of} ${state.totalQuestions}`,
    ),
    renderDots(),
    h("div", { class: "content-quiz-nav" }, [
      renderButton([h(Icon, { name: "lucide:chevron-left", ariaHidden: true }), text.value.back], {
        disabled: activeIndex.value === 0,
        onClick: () => {
          activeIndex.value--;
        },
      }),
      isLast
        ? renderButton(text.value.results, {
            disabled: !currentAnswered.value,
            onClick: () => {
              showResults.value = true;
            },
          })
        : renderButton(
            [text.value.next, h(Icon, { name: "lucide:chevron-right", ariaHidden: true })],
            {
              disabled: !currentAnswered.value,
              onClick: () => {
                activeIndex.value++;
              },
            },
          ),
    ]),
  ]);
}

function renderResults() {
  const perfect = correctCount.value === state.totalQuestions;

  return h("div", { class: "content-quiz-results" }, [
    h(
      "div",
      {
        class: "content-quiz-results-icon",
        "data-state": perfect ? "perfect" : undefined,
      },
      [h(Icon, { name: "lucide:trophy", ariaHidden: true })],
    ),
    h("div", {}, [
      h(
        "p",
        { class: "content-quiz-results-score" },
        `${correctCount.value} ${text.value.of} ${state.totalQuestions} ${text.value.correct}`,
      ),
      h(
        "p",
        { class: "content-quiz-results-note" },
        perfect ? text.value.perfect : text.value.retryPrompt,
      ),
    ]),
    renderButton(text.value.reset, { onClick: reset }),
  ]);
}

function renderQuiz() {
  const items = getQuestionNodes();

  if (!items.length) return null;

  const children: VNode[] = [renderHeader()];

  if (showResults.value) {
    children.push(h("div", { class: "content-quiz-body" }, [renderResults()]));
  } else {
    children.push(
      h(
        "div",
        { class: "content-quiz-body" },
        items.map((node, i) =>
          h(
            "div",
            {
              key: i,
              style: i === activeIndex.value ? undefined : { display: "none" },
            },
            [cloneVNode(node)],
          ),
        ),
      ),
    );
    if (state.totalQuestions > 1) {
      children.push(renderFooter());
    }
  }

  return h(
    "div",
    {
      "data-appearance": appearance.value,
      class: "content-quiz not-prose",
    },
    children,
  );
}
</script>

<template>
  <component :is="renderQuiz" />
</template>
