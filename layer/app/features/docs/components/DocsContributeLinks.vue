<script setup lang="ts">
import type { GinkoDocsAppConfig } from "../../../../shared/types/app-config";
import { computed } from "vue";
import { useAppConfig, useI18n, useRoute } from "#imports";

const props = withDefaults(
  defineProps<{
    stem?: string;
    extension?: string;
    title: string;
    variant?: "article" | "rail";
  }>(),
  {
    variant: "article",
  },
);

const route = useRoute();
const { t } = useI18n();
const repository = (useAppConfig().ginkoDocs as GinkoDocsAppConfig).repository;

const sourcePath = computed(() => {
  if (!repository || !props.stem) return null;
  const directory = repository.contentDirectory?.replace(/^\/+|\/+$/g, "") ?? "content";
  const extension = props.extension?.replace(/^\./, "") || "md";
  return `${directory}/${props.stem}.${extension}`;
});

const editUrl = computed(() => {
  if (!repository || !sourcePath.value) return null;
  const branch = repository.branch || "main";
  return `${repository.url.replace(/\/$/, "")}/edit/${encodeURIComponent(branch)}/${sourcePath.value}`;
});

const issueUrl = computed(() => {
  if (!repository) return null;
  const url = new URL(`${repository.url.replace(/\/$/, "")}/issues/new`);
  url.searchParams.set("title", t("docs.issueTitle", { title: props.title }));
  url.searchParams.set("body", t("docs.issueBody", { path: route.path }));
  return url.toString();
});
</script>

<template>
  <div
    v-if="repository"
    :class="
      variant === 'rail'
        ? 'flex flex-col gap-2.5 text-sm'
        : 'mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5 text-sm'
    "
    :aria-label="t('docs.contribute')"
  >
    <a
      v-if="editUrl"
      :href="editUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex min-h-9 items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name="lucide:pen-line" class="size-4" aria-hidden="true" />
      {{ t("docs.editPage") }}
    </a>
    <a
      v-if="issueUrl"
      :href="issueUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex min-h-9 items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name="lucide:circle-alert" class="size-4" aria-hidden="true" />
      {{ t("docs.reportIssue") }}
    </a>
  </div>
</template>
