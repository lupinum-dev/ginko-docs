<script setup lang="ts">
import type { GinkoDocsAppConfig } from "../../../../shared/types/app-config";
import { computed } from "vue";
import { useAppConfig, useI18n, useRoute } from "#imports";
import { buildRepoEditUrl, buildRepoIssueUrl } from "#ginko-docs/utils/repository";

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

const editUrl = computed(() =>
  repository && sourcePath.value ? buildRepoEditUrl(repository, sourcePath.value) : null,
);

const issueUrl = computed(() =>
  repository
    ? buildRepoIssueUrl(repository, {
        title: t("docs.issueTitle", { title: props.title }),
        body: t("docs.issueBody", { path: route.path }),
      })
    : null,
);
</script>

<template>
  <div
    v-if="repository"
    :class="
      variant === 'rail'
        ? 'flex flex-col gap-2.5 text-sm'
        : 'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'
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
