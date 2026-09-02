<script setup lang="ts">
import { nextTick, onBeforeUnmount, watch } from "vue";
import { useRoute } from "#imports";
import { getSearchHighlightTerms } from "#ginko-docs/features/search/command-center";

const STORAGE_KEY = "site-command-center-page-highlight";
const HIGHLIGHT_SELECTOR = "mark[data-search-page-highlight]";
const SKIP_SELECTOR = "script, style, textarea, input, select, button, mark";

const route = useRoute();

type StoredHighlight = {
  href: string;
  query: string;
};

function readStoredHighlight(): StoredHighlight | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoredHighlight>;
    if (typeof parsed.href !== "string" || typeof parsed.query !== "string") return null;
    return { href: parsed.href, query: parsed.query };
  } catch {
    return null;
  }
}

function removeHighlights() {
  for (const mark of document.querySelectorAll(HIGHLIGHT_SELECTOR)) {
    const parent = mark.parentNode;
    if (!parent) continue;
    mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
    parent.normalize();
  }
}

function highlightPattern(root: Element, pattern: RegExp) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim() || !pattern.test(node.textContent)) {
        pattern.lastIndex = 0;
        return NodeFilter.FILTER_REJECT;
      }
      pattern.lastIndex = 0;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const text = node.textContent ?? "";
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      const value = match[0];
      if (!value) continue;

      fragment.append(document.createTextNode(text.slice(lastIndex, index)));

      const mark = document.createElement("mark");
      mark.dataset.searchPageHighlight = "";
      mark.className =
        "rounded-[3px] bg-accent-yellow px-0.5 font-medium text-accent-yellow-foreground";
      mark.textContent = value;
      fragment.append(mark);

      lastIndex = index + value.length;
    }

    fragment.append(document.createTextNode(text.slice(lastIndex)));
    node.replaceWith(fragment);
  }
}

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildPatterns(query: string) {
  const phrase = query.trim().replace(/\s+/g, " ");
  const tokens = getSearchHighlightTerms(phrase);
  const phrasePattern = phrase.split(/\s+/).map(escapePattern).join("\\s+");

  return [
    new RegExp(phrasePattern, "gi"),
    ...(tokens.length > 1 ? [new RegExp(tokens.map(escapePattern).join("|"), "gi")] : []),
  ];
}

async function applyStoredHighlight() {
  removeHighlights();

  const stored = readStoredHighlight();
  if (!stored) return;

  const currentPath = `${route.path}${route.hash}`;
  if (stored.href !== route.fullPath && stored.href !== currentPath && stored.href !== route.path) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  await nextTick();

  const root = document.querySelector("#main-content") ?? document.querySelector("main");
  if (!root) return;

  for (const pattern of buildPatterns(stored.query)) {
    highlightPattern(root, pattern);
    if (root.querySelector(HIGHLIGHT_SELECTOR)) break;
  }
}

watch(() => route.fullPath, applyStoredHighlight, { immediate: true });
onBeforeUnmount(removeHighlights);
</script>

<template>
  <span hidden aria-hidden="true" />
</template>
