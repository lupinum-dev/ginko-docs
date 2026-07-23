<script setup lang="ts">
import { localizedRoutes } from "../i18n/routes";
import { messages } from "../i18n/messages/index";
import { normalizeAppError } from "./lib/errors";
import { computed } from "vue";
import { clearError, useHead } from "#imports";
import { localeFromPath, localizedPath } from "../i18n/locales";

type NuxtErrorLike = {
  message?: string;
  status?: number;
  statusCode?: number;
  statusMessage?: string;
  statusText?: string;
  url?: string;
};

const props = defineProps<{
  error: NuxtErrorLike;
}>();

const normalized = computed(() => normalizeAppError(props.error));
const requestPath = computed(
  () => props.error?.url || (import.meta.client ? window.location.pathname : "/"),
);
const locale = computed(() => localeFromPath(requestPath.value));
const copy = computed(() => {
  const catalog = messages[locale.value].errors;
  return catalog[normalized.value.kind] ?? catalog.unavailable;
});
const homePath = computed(() => localizedPath(locale.value, localizedRoutes[locale.value].home));
const docsPath = computed(() => localizedPath(locale.value, localizedRoutes[locale.value].docs));
const title = computed(() => `${normalized.value.statusCode} - ${copy.value.title}`);
// Keep the full site chrome for content-level errors (404 and friends); hard
// server failures fall back to the bare page so the error screen cannot crash.
const showChrome = computed(() => normalized.value.kind !== "server");

useHead(() => ({
  title: title.value,
  meta: [{ name: "robots", content: "noindex, nofollow" }],
}));

const handleError = () => clearError({ redirect: homePath.value });
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background text-foreground">
    <template v-if="showChrome">
      <SiteSkipLink />
      <SiteHeader />
    </template>
    <main id="main-content" class="flex flex-1 items-center justify-center px-4 py-24">
      <section class="w-full max-w-xl text-center">
        <p
          class="mb-6 text-8xl leading-none font-bold text-primary/20 select-none"
          aria-hidden="true"
        >
          {{ normalized.statusCode }}
        </p>

        <h1 class="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {{ copy.title }}
        </h1>
        <p class="mx-auto mb-8 max-w-md leading-7 text-muted-foreground">
          {{ copy.description }}
        </p>

        <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button class="error-action error-action-primary" type="button" @click="handleError">
            {{ messages[locale].errors.actions.home }}
          </button>
          <a class="error-action error-action-secondary" :href="docsPath">
            {{ messages[locale].errors.actions.docs }}
          </a>
        </div>
      </section>
    </main>
    <SiteFooter v-if="showChrome" />
  </div>
</template>

<style scoped>
.error-action {
  align-items: center;
  border-radius: 0.375rem;
  display: inline-flex;
  font-size: 0.875rem;
  font-weight: 500;
  height: 2.5rem;
  justify-content: center;
  padding-inline: 1rem;
  transition:
    background-color 150ms,
    color 150ms,
    border-color 150ms;
}

.error-action:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.error-action-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}

.error-action-primary:hover {
  opacity: 0.9;
}

.error-action-secondary {
  background: var(--background);
  border: 1px solid var(--input);
}

.error-action-secondary:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
</style>
