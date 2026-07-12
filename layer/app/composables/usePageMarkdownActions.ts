import { agentRawPathForRoute } from "@lupinum/ginko-content/agent-paths";
import { useClipboard } from "@vueuse/core";
import { computed, onBeforeUnmount, ref } from "vue";
import { useAppConfig, useRoute } from "#imports";

export type PageMarkdownAction = "markdown" | "link" | "mcp";
export type PageMarkdownActionResult = "success" | "error";

export function usePageMarkdownActions() {
  const route = useRoute();
  const config = useAppConfig().ginkoDocs;
  const { copy } = useClipboard({ legacy: true });
  const result = ref<{ action: PageMarkdownAction; status: PageMarkdownActionResult } | null>(null);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  const rawPath = computed(() => agentRawPathForRoute(route.path));
  const rawUrl = computed(() => new URL(rawPath.value, config.site.url).toString());
  const mcpUrl = computed(() => new URL("/mcp", config.site.url).toString());
  const chatGptUrl = computed(
    () =>
      `https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read ${rawUrl.value} so I can ask questions about it.`)}`,
  );

  function setResult(action: PageMarkdownAction, status: PageMarkdownActionResult) {
    if (resetTimer) clearTimeout(resetTimer);
    result.value = { action, status };
    resetTimer = setTimeout(
      () => {
        result.value = null;
      },
      status === "success" ? 1800 : 4000,
    );
  }

  async function run(action: PageMarkdownAction, operation: () => Promise<void>) {
    try {
      await operation();
      setResult(action, "success");
    } catch {
      setResult(action, "error");
    }
  }

  const copyValue = (value: string, action: Exclude<PageMarkdownAction, "markdown">) =>
    run(action, () => copy(value));

  const copyMarkdown = () =>
    run("markdown", async () => {
      const response = await fetch(rawPath.value);
      if (!response.ok) throw new Error(`Markdown request failed with ${response.status}`);
      await copy(await response.text());
    });

  onBeforeUnmount(() => {
    if (resetTimer) clearTimeout(resetTimer);
  });

  return { chatGptUrl, copyMarkdown, copyValue, mcpUrl, rawPath, rawUrl, result };
}
