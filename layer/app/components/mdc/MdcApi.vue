<script setup lang="ts">
import { computed, onMounted, ref, useId } from "vue";
import { cn } from "../../utils";
import { apiEntryId, normalizeApiGroups, signatureTail, splitInlineCode } from "./api.utils";
import { resolveIconifyIcon } from "./icons";
import { useProseAppearance } from "../../composables/useProseAppearance";

const props = defineProps<{
  title?: string;
  icon?: string;
  method?: string;
  path?: string;
  groups?: unknown;
  appearance?: "quiet" | "tint";
}>();
const appearance = useProseAppearance("api", () => props.appearance);

const groups = computed(() => normalizeApiGroups(props.groups));
const activeIndex = ref(0);
const panelId = useId();

const iconName = computed(() => resolveIconifyIcon(props.icon));

function handleKeydown(event: KeyboardEvent, currentIndex: number) {
  let nextIndex: number | undefined;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % groups.value.length;
  if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + groups.value.length) % groups.value.length;
  }
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = groups.value.length - 1;
  if (nextIndex === undefined) return;

  event.preventDefault();
  activeIndex.value = nextIndex;
  const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>(
    '[role="tab"]',
  );
  tabs?.[nextIndex]?.focus();
}

function applyHash(hash: string) {
  if (!hash) return;
  const index = groups.value.findIndex((group) =>
    group.entries.some((entry) => apiEntryId(group.label, entry.name) === hash),
  );
  if (index === -1) return;
  activeIndex.value = index;
  requestAnimationFrame(() => {
    document.getElementById(hash)?.scrollIntoView();
  });
}

onMounted(() => {
  applyHash(window.location.hash.slice(1));
});
</script>

<template>
  <div
    v-if="groups.length"
    class="content-api content-tabs not-prose"
    :data-appearance="appearance"
    :data-stacked-header="groups.length > 1 ? 'true' : undefined"
  >
    <div class="content-tabs-header content-api-header">
      <span v-if="method && path" class="content-api-identity">
        <span class="content-api-method">
          {{ method.toUpperCase() }}
        </span>
        <span class="content-api-path">{{ path }}</span>
      </span>
      <span v-else-if="title" class="content-api-identity content-api-title">
        <Icon
          v-if="iconName"
          :name="iconName"
          mode="svg"
          class="content-api-title-icon"
          aria-hidden="true"
        />
        <span class="content-api-path">{{ title }}</span>
      </span>

      <div class="content-tabs-list content-api-tabs" role="tablist">
        <button
          v-for="(group, index) in groups"
          :key="group.label"
          type="button"
          role="tab"
          :id="`${panelId}-tab-${index}`"
          :aria-selected="activeIndex === index"
          :aria-controls="`${panelId}-${index}`"
          :tabindex="activeIndex === index ? 0 : -1"
          :class="cn('content-tabs-tab', activeIndex === index && 'content-tabs-tab-active')"
          @click="activeIndex = index"
          @keydown="handleKeydown($event, index)"
        >
          {{ group.label }}
          <span class="content-api-count">
            {{ group.entries.length }}
          </span>
        </button>
      </div>
    </div>

    <div class="content-tabs-panels">
      <div
        v-for="(group, index) in groups"
        :id="`${panelId}-${index}`"
        :key="group.label"
        role="tabpanel"
        :aria-labelledby="`${panelId}-tab-${index}`"
        :style="activeIndex === index ? undefined : { display: 'none' }"
      >
        <div
          v-for="entry in group.entries"
          :id="apiEntryId(group.label, entry.name)"
          :key="entry.name"
          class="content-api-row"
          style="scroll-margin-top: var(--content-scroll-margin)"
        >
          <code class="content-api-signature" :data-entry="entry.name">
            <span
              :class="cn('content-api-name', entry.deprecated && 'content-api-name-deprecated')"
              >{{ entry.name }}</span
            ><span v-if="signatureTail(entry)" class="content-api-type">{{
              signatureTail(entry)
            }}</span>
          </code>

          <span v-if="entry.required || entry.deprecated || entry.since" class="content-api-badges">
            <span v-if="entry.required" class="content-api-badge" data-state="required">
              required
            </span>
            <span v-if="entry.deprecated" class="content-api-badge" data-state="deprecated">
              deprecated
            </span>
            <span v-if="entry.since" class="content-api-badge" data-state="since">
              since {{ entry.since }}
            </span>
          </span>

          <!-- A div, not a p: the prose stylesheet's unlayered `.content-prose p`
            rules (1rem margins, inherited 1rem/1.75 type) override layered
            utilities and are not guarded by not-prose. -->
          <div v-if="entry.description" class="content-api-description">
            <template
              v-for="(part, partIndex) in splitInlineCode(entry.description)"
              :key="partIndex"
            >
              <code v-if="part.code" class="content-api-inline-code">{{ part.text }}</code
              ><template v-else>{{ part.text }}</template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
