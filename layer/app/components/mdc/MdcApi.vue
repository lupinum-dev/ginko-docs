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
  >
    <div class="content-tabs-header">
      <span
        v-if="method && path"
        class="flex min-w-0 items-center gap-1.5 whitespace-nowrap ps-1 pe-1"
      >
        <span
          class="inline-flex h-5 items-center rounded-md bg-accent-blue-muted px-1.5 font-mono text-[0.6875rem]/none font-semibold text-accent-blue"
        >
          {{ method.toUpperCase() }}
        </span>
        <span class="truncate font-mono text-[0.8125rem] text-foreground/80">{{ path }}</span>
      </span>
      <span
        v-else-if="title"
        class="flex min-w-0 items-center gap-1.5 whitespace-nowrap ps-1 pe-1 text-[0.8125rem] font-medium text-foreground/80"
      >
        <Icon
          v-if="iconName"
          :name="iconName"
          mode="svg"
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span class="truncate">{{ title }}</span>
      </span>

      <div class="content-tabs-list" role="tablist">
        <button
          v-for="(group, index) in groups"
          :key="group.label"
          type="button"
          role="tab"
          :aria-selected="activeIndex === index"
          :aria-controls="`${panelId}-${index}`"
          :class="cn('content-tabs-tab', activeIndex === index && 'content-tabs-tab-active')"
          @click="activeIndex = index"
        >
          {{ group.label }}
          <span class="rounded-full bg-muted px-1.5 py-px text-[0.6875rem] text-muted-foreground">
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
        :style="activeIndex === index ? undefined : { display: 'none' }"
      >
        <div
          v-for="entry in group.entries"
          :id="apiEntryId(group.label, entry.name)"
          :key="entry.name"
          class="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-0.5 border-t border-border px-3 py-2.5 first:border-t-0"
          style="scroll-margin-top: var(--content-scroll-margin)"
        >
          <code
            class="overflow-x-auto font-mono text-[0.8125rem] leading-normal whitespace-nowrap"
            :data-entry="entry.name"
          >
            <span
              :class="
                cn(
                  'font-medium text-accent-blue',
                  entry.deprecated && 'line-through decoration-foreground/40 opacity-70',
                )
              "
              >{{ entry.name }}</span
            ><span v-if="signatureTail(entry)" class="text-muted-foreground">{{
              signatureTail(entry)
            }}</span>
          </code>

          <span
            v-if="entry.required || entry.deprecated || entry.since"
            class="flex items-center gap-1"
          >
            <span
              v-if="entry.required"
              class="inline-flex h-4.5 items-center rounded-full bg-accent-coral-muted px-1.75 text-[0.6875rem]/none font-semibold tracking-wide text-accent-coral"
            >
              required
            </span>
            <span
              v-if="entry.deprecated"
              class="inline-flex h-4.5 items-center rounded-full bg-accent-yellow-muted px-1.75 text-[0.6875rem]/none font-semibold tracking-wide text-warning"
            >
              deprecated
            </span>
            <span
              v-if="entry.since"
              class="inline-flex h-4.5 items-center rounded-full bg-accent-mint-muted px-1.75 text-[0.6875rem]/none font-semibold tracking-wide text-success"
            >
              since {{ entry.since }}
            </span>
          </span>

          <!-- A div, not a p: the prose stylesheet's unlayered `.content-prose p`
            rules (1rem margins, inherited 1rem/1.75 type) override layered
            utilities and are not guarded by not-prose. -->
          <div
            v-if="entry.description"
            class="col-span-full text-[0.8125rem] leading-normal text-muted-foreground"
          >
            <template
              v-for="(part, partIndex) in splitInlineCode(entry.description)"
              :key="partIndex"
            >
              <code
                v-if="part.code"
                class="rounded-sm bg-muted px-1 py-px font-mono text-[0.75rem] text-foreground"
                >{{ part.text }}</code
              ><template v-else>{{ part.text }}</template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
