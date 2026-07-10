<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { useI18n, useRoute } from "#imports";
import { useCommandCenter } from "@/features/search/useCommandCenter";
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from "reka-ui";

const { open, query, groupedItems, openCommandCenter, selectItem } = await useCommandCenter();
const { t } = useI18n();

const route = useRoute();
const inputRef = useTemplateRef<HTMLInputElement>("input");
const highlightedId = ref("");

const visibleItems = computed(() => groupedItems.value.flatMap((g) => g.items));

// ── text highlighting ──────────────────────────────────────────────────────
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlight(text: string, q: string): string {
  if (!q.trim()) return escapeHtml(text);
  const pattern = q
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .split(/\s+/)
    .filter(Boolean)
    .join("|");
  const parts = text.split(new RegExp(`(${pattern})`, "gi"));
  return parts
    .map((part) =>
      part.toLowerCase() === q.trim().toLowerCase() ||
      q
        .trim()
        .split(/\s+/)
        .some((t) => part.toLowerCase() === t.toLowerCase())
        ? `<mark class="bg-primary/15 text-primary rounded-[3px] font-medium not-italic">${escapeHtml(part)}</mark>`
        : escapeHtml(part),
    )
    .join("");
}

// ── keyboard navigation ────────────────────────────────────────────────────
function syncHighlight() {
  const first = visibleItems.value[0]?.id ?? "";
  if (!first) {
    highlightedId.value = "";
    return;
  }
  if (!visibleItems.value.some((i) => i.id === highlightedId.value)) {
    highlightedId.value = first;
  }
}

function moveHighlight(dir: 1 | -1) {
  if (!visibleItems.value.length) return;
  const idx = visibleItems.value.findIndex((i) => i.id === highlightedId.value);
  const next = idx === -1 ? 0 : (idx + dir + visibleItems.value.length) % visibleItems.value.length;
  highlightedId.value = visibleItems.value[next]?.id ?? "";
}

async function activateHighlighted() {
  const item = visibleItems.value.find((i) => i.id === highlightedId.value);
  if (item) await selectItem(item);
}

async function clearQuery() {
  query.value = "";
  await nextTick();
  inputRef.value?.focus();
}

function itemLabel(item: { title: string; subtitle?: string; badge?: string }) {
  return [item.title, item.badge, item.subtitle].filter(Boolean).join(", ");
}

function handleGlobalShortcut(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  const typing =
    el instanceof HTMLElement &&
    (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openCommandCenter();
    return;
  }
  if (!open.value && !typing && e.key === "/") {
    e.preventDefault();
    openCommandCenter();
  }
}

function handleListNavigation(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    moveHighlight(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    moveHighlight(-1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    void activateHighlighted();
  }
}

watch(open, async (isOpen) => {
  if (!isOpen) {
    highlightedId.value = "";
    return;
  }
  await nextTick();
  syncHighlight();
  inputRef.value?.focus();
});

watch([query, groupedItems], async () => {
  syncHighlight();
  await nextTick();
  if (!highlightedId.value || !import.meta.client) return;
  document
    .querySelector<HTMLElement>(`[data-item="${highlightedId.value}"]`)
    ?.scrollIntoView({ block: "nearest" });
});

watch(
  () => route.fullPath,
  () => {
    highlightedId.value = "";
  },
);

onMounted(() => window.addEventListener("keydown", handleGlobalShortcut));
onBeforeUnmount(() => window.removeEventListener("keydown", handleGlobalShortcut));
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed top-[8vh] left-1/2 z-50 flex max-h-[84vh] w-[min(94vw,46rem)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:top-[10vh]"
        @keydown="handleListNavigation"
      >
        <VisuallyHidden>
          <DialogTitle>{{ t("command.title") }}</DialogTitle>
          <DialogDescription>{{ t("command.description") }}</DialogDescription>
        </VisuallyHidden>

        <!-- Search input -->
        <div class="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 sm:px-4">
          <Icon
            name="lucide:search"
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref="input"
            v-model="query"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :placeholder="t('command.placeholder')"
            class="h-full min-w-0 flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
          />
          <kbd
            v-if="!query"
            class="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:flex"
          >
            Esc
          </kbd>
          <button
            v-else
            type="button"
            :aria-label="t('command.clear')"
            class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
            @click="clearQuery"
          >
            <Icon name="lucide:x" class="size-3" aria-hidden="true" />
          </button>
        </div>

        <!-- Results -->
        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
          <!-- Groups -->
          <template v-if="visibleItems.length">
            <div v-for="group in groupedItems" :key="group.id" class="mb-1 px-2 last:mb-0">
              <div class="flex items-center gap-2 px-2 pt-1.5 pb-1">
                <span class="text-[11px] font-medium text-muted-foreground">{{ group.title }}</span>
                <div class="flex-1 border-t border-border/60" />
              </div>

              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                :data-item="item.id"
                :aria-label="itemLabel(item)"
                class="group flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors outline-none"
                :class="
                  highlightedId === item.id ? 'bg-accent text-accent-foreground' : 'text-foreground'
                "
                @mousemove="highlightedId = item.id"
                @focus="highlightedId = item.id"
                @click="void selectItem(item)"
              >
                <!-- Icon -->
                <div
                  class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 transition-colors"
                  :class="highlightedId === item.id ? 'border-border/80 bg-background' : ''"
                >
                  <Icon
                    v-if="group.id === 'recent'"
                    name="lucide:clock"
                    class="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Icon
                    v-else
                    :name="item.icon ?? 'lucide:file-text'"
                    class="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>

                <!-- Text -->
                <div class="min-w-0 flex-1">
                  <div class="flex min-w-0 items-center gap-2">
                    <!-- eslint-disable vue/no-v-html -->
                    <span
                      class="min-w-0 truncate text-sm leading-5 font-medium"
                      v-html="highlight(item.title, query)"
                    />
                    <span
                      v-if="item.badge"
                      class="shrink-0 rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary"
                    >
                      {{ item.badge }}
                    </span>
                  </div>
                  <p
                    v-if="item.subtitle"
                    class="mt-0.5 flex min-w-0 items-start gap-1 text-xs leading-5 text-muted-foreground"
                  >
                    <Icon
                      name="lucide:hash"
                      class="mt-1 size-3 shrink-0 opacity-50"
                      aria-hidden="true"
                    />
                    <span class="line-clamp-2 min-w-0" v-html="highlight(item.subtitle, query)" />
                    <!-- eslint-enable vue/no-v-html -->
                  </p>
                </div>

                <!-- Right hint -->
                <div class="mt-1 flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <Icon
                    v-if="item.external"
                    name="lucide:arrow-up-right"
                    class="size-3.5 opacity-0 transition-opacity"
                    :class="highlightedId === item.id ? 'opacity-100' : 'group-hover:opacity-60'"
                    aria-hidden="true"
                  />
                  <kbd
                    v-else
                    class="hidden items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] transition-opacity"
                    :class="highlightedId === item.id ? 'flex opacity-100' : 'opacity-0'"
                  >
                    ↵
                  </kbd>
                </div>
              </button>
            </div>
          </template>

          <!-- Empty state -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center"
          >
            <div
              class="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50"
            >
              <Icon name="lucide:search" class="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p class="text-sm font-medium text-foreground">
              {{ t("command.noResults", { query }) }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ t("command.noResultsHelp") }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex shrink-0 items-center justify-between border-t border-border px-3 py-2.5 text-[11px] text-muted-foreground sm:px-4"
        >
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            <span class="flex items-center gap-1">
              <kbd class="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                >↑↓</kbd
              >
              {{ t("command.navigate") }}
            </span>
            <span class="hidden items-center gap-1 sm:flex">
              <kbd class="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                >↵</kbd
              >
              {{ t("command.open") }}
            </span>
            <span class="hidden items-center gap-1 sm:flex">
              <kbd class="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                >Esc</kbd
              >
              {{ t("command.close") }}
            </span>
          </div>
          <span class="shrink-0 sm:hidden">{{ t("command.closeHint") }}</span>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
