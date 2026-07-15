<script setup lang="ts">
import { Button } from "#ginko-docs/components/ui/button";
import { computed, ref } from "vue";
import { useI18n, useRoute } from "#imports";
import { useGinkoAnalytics } from "#ginko-docs/composables/useGinkoAnalytics";
import { useGinkoDocsConfig } from "#ginko-docs/composables/useGinkoDocsConfig";

withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: undefined,
  },
);
const { t, locale } = useI18n();
const route = useRoute();

const config = useGinkoDocsConfig();
const enabled = config.feedback.enabled;
const { track } = useGinkoAnalytics();

type Sentiment = "positive" | "negative";

const sentiment = ref<Sentiment | null>(null);

const issueUrl = computed(() => {
  const repository = config.repository;
  if (!repository) return null;
  const url = new URL(`${repository.url.replace(/\/$/, "")}/issues/new`);
  url.searchParams.set("title", t("feedback.issueTitle", { path: route.path }));
  url.searchParams.set("body", t("docs.issueBody", { path: route.path }));
  return url.toString();
});

function selectSentiment(s: Sentiment) {
  if (sentiment.value !== null) return;
  sentiment.value = s;
  track("docs-feedback", {
    path: route.path,
    helpful: s === "positive" ? "yes" : "no",
    locale: locale.value,
  });
}
</script>

<template>
  <div v-if="enabled" class="mt-14 border-y border-border py-5">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div v-if="sentiment !== null" class="flex flex-wrap items-center gap-x-3 gap-y-1 py-1">
        <p class="text-sm text-muted-foreground">
          {{ t("feedback.thanks") }}
        </p>
        <a
          v-if="sentiment === 'negative' && issueUrl"
          :href="issueUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-2 transition-colors hover:text-muted-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Icon name="lucide:circle-alert" class="size-4" aria-hidden="true" />
          {{ t("docs.reportIssue") }}
        </a>
      </div>
    </Transition>

    <div v-if="sentiment === null" class="flex flex-wrap items-center gap-3">
      <p class="text-sm font-semibold text-foreground">{{ label ?? t("feedback.label") }}</p>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="h-9 w-20 rounded-full px-4 text-muted-foreground shadow-sm"
          @click="selectSentiment('positive')"
        >
          <Icon name="lucide:thumbs-up" class="shrink-0" aria-hidden="true" />
          {{ t("feedback.yes") }}
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="h-9 w-20 rounded-full px-4 text-muted-foreground shadow-sm"
          @click="selectSentiment('negative')"
        >
          <Icon name="lucide:thumbs-down" class="shrink-0" aria-hidden="true" />
          {{ t("feedback.no") }}
        </Button>
      </div>
    </div>
  </div>
</template>
