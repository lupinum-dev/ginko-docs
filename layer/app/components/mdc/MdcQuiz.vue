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
      class: cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
        options.variant === "ghost"
          ? "hover:bg-accent hover:text-accent-foreground"
          : "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      ),
      onClick: options.onClick,
    },
    children,
  );
}

function renderHeader() {
  return h("div", { class: "flex flex-row items-center gap-4 px-6" }, [
    h(
      "div",
      {
        class:
          "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
      },
      [h(Icon, { name: "lucide:circle-help", class: "size-4", ariaHidden: true })],
    ),
    h("div", { class: "min-w-0 flex-1" }, [
      props.title
        ? h("div", { class: "font-semibold leading-none tracking-tight" }, props.title)
        : null,
      props.description
        ? h("div", { class: "text-sm text-muted-foreground" }, props.description)
        : null,
    ]),
  ]);
}

function renderDots() {
  return h(
    "div",
    { class: "flex items-center gap-1.5" },
    Array.from({ length: state.totalQuestions }, (_, i) =>
      h("button", {
        type: "button",
        class: cn(
          "size-2 rounded-full transition-all",
          i === activeIndex.value
            ? "scale-125 bg-primary ring-2 ring-primary/30"
            : state.answers.has(i)
              ? "bg-primary"
              : "bg-muted-foreground/30",
        ),
        onClick: () => {
          activeIndex.value = i;
        },
      }),
    ),
  );
}

function renderFooter() {
  const isLast = activeIndex.value === state.totalQuestions - 1;

  return h("div", { class: "flex items-center justify-between border-t px-6 py-4" }, [
    h(
      "span",
      { class: "text-sm text-muted-foreground" },
      `${text.value.question} ${activeIndex.value + 1} ${text.value.of} ${state.totalQuestions}`,
    ),
    renderDots(),
    h("div", { class: "flex items-center gap-2" }, [
      renderButton(
        [
          h(Icon, { name: "lucide:chevron-left", class: "size-4", ariaHidden: true }),
          text.value.back,
        ],
        {
          disabled: activeIndex.value === 0,
          onClick: () => {
            activeIndex.value--;
          },
        },
      ),
      isLast
        ? renderButton(text.value.results, {
            disabled: !currentAnswered.value,
            onClick: () => {
              showResults.value = true;
            },
          })
        : renderButton(
            [
              text.value.next,
              h(Icon, { name: "lucide:chevron-right", class: "size-4", ariaHidden: true }),
            ],
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

  return h("div", { class: "flex flex-col items-center gap-4 px-6 py-8 text-center" }, [
    h(
      "div",
      {
        class: cn(
          "flex size-12 items-center justify-center rounded-full",
          perfect ? "bg-success/10" : "bg-muted",
        ),
      },
      [
        h(Icon, {
          name: "lucide:trophy",
          class: cn("size-6", perfect ? "text-success" : "text-muted-foreground"),
          ariaHidden: true,
        }),
      ],
    ),
    h("div", {}, [
      h(
        "p",
        { class: "text-lg font-semibold text-foreground" },
        `${correctCount.value} ${text.value.of} ${state.totalQuestions} ${text.value.correct}`,
      ),
      h(
        "p",
        { class: "mt-1 text-sm text-muted-foreground" },
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
    children.push(renderResults());
  } else {
    children.push(
      h(
        "div",
        { class: "px-6" },
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
      "data-slot": "card",
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
