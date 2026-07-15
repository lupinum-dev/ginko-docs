<script setup lang="ts">
import { Button } from "#ginko-docs/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#ginko-docs/components/ui/dropdown-menu";
import { computed } from "vue";
import { useI18n } from "#imports";
import { usePageMarkdownActions } from "#ginko-docs/composables/usePageMarkdownActions";

const props = withDefaults(
  defineProps<{
    label?: string;
    copiedLabel?: string;
  }>(),
  {},
);

const { t } = useI18n();
const { actions, chatGptUrl, claudeUrl, copyMarkdown, copyValue, mcpUrl, rawPath, rawUrl, result } =
  usePageMarkdownActions();
const label = computed(() => props.label ?? t("docs.copyMarkdown"));
const copiedLabel = computed(() => props.copiedLabel ?? t("docs.copied"));
const markdownSucceeded = computed(
  () => result.value?.action === "markdown" && result.value.status === "success",
);
const actionSucceeded = (action: "link" | "mcp") =>
  result.value?.action === action && result.value.status === "success";
const statusMessage = computed(() => {
  if (!result.value) return "";
  return result.value.status === "success" ? copiedLabel.value : t("docs.copyFailed");
});
</script>

<template>
  <div class="inline-flex shrink-0 items-center">
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="h-9 gap-1.5 rounded-r-none border-r-0 px-2.5 text-xs has-[>svg]:px-2.5"
      :aria-label="markdownSucceeded ? copiedLabel : label"
      @click="copyMarkdown"
    >
      <Icon
        :name="markdownSucceeded ? 'lucide:check' : 'lucide:copy'"
        class="size-3.5"
        aria-hidden="true"
      />
      <span class="hidden sm:inline">{{ markdownSucceeded ? copiedLabel : label }}</span>
    </Button>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="h-9 w-8 rounded-l-none px-0"
          :aria-label="t('docs.moreActions')"
        >
          <Icon name="lucide:chevron-down" class="size-3.5" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuItem @select="copyValue(rawUrl, 'link')">
          <Icon :name="actionSucceeded('link') ? 'lucide:check' : 'lucide:link'" />
          {{ actionSucceeded("link") ? t("docs.copied") : t("docs.copyLink") }}
        </DropdownMenuItem>
        <DropdownMenuItem as-child>
          <a :href="rawPath" target="_blank" rel="noopener noreferrer">
            <Icon name="lucide:file-code-2" />
            {{ t("docs.viewMarkdown") }}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem v-if="actions.claude" as-child>
          <a :href="claudeUrl" target="_blank" rel="noopener noreferrer">
            <Icon name="lucide:sparkles" />
            {{ t("docs.askClaude") }}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem v-if="actions.chatGpt" as-child>
          <a :href="chatGptUrl" target="_blank" rel="noopener noreferrer">
            <Icon name="lucide:message-circle" />
            {{ t("docs.askChatGpt") }}
          </a>
        </DropdownMenuItem>
        <template v-if="actions.mcp">
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="copyValue(mcpUrl, 'mcp')">
            <Icon :name="actionSucceeded('mcp') ? 'lucide:check' : 'lucide:plug'" />
            {{ actionSucceeded("mcp") ? t("docs.copied") : t("docs.copyMcpUrl") }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
    <span class="sr-only" role="status" aria-live="polite">{{ statusMessage }}</span>
  </div>
</template>
