<script setup lang="ts">
import { NuxtLink } from "#components";
import { computed } from "vue";
import { useProseAppearance } from "../../composables/useProseAppearance";
import { isExternalLink, resolveIconifyIcon } from "./icons";

type ReadMoreLink = {
  title: string;
  to: string;
  description?: string;
  target?: string;
  icon?: string;
};

const props = defineProps<{
  title?: string;
  links?: unknown;
  appearance?: "quiet" | "tint";
}>();

const appearance = useProseAppearance("readMore", () => props.appearance);
const items = computed<ReadMoreLink[]>(() =>
  Array.isArray(props.links)
    ? props.links.filter(
        (link): link is ReadMoreLink =>
          Boolean(link) &&
          typeof link === "object" &&
          typeof link.title === "string" &&
          typeof link.to === "string",
      )
    : [],
);

const componentFor = (to: string) => (isExternalLink(to) ? "a" : NuxtLink);
const linkProps = (item: ReadMoreLink) =>
  isExternalLink(item.to)
    ? { href: item.to, target: item.target, rel: "noreferrer noopener" }
    : { to: item.to, target: item.target };
</script>

<template>
  <nav
    v-if="items.length"
    class="content-read-more not-prose"
    :data-appearance="appearance"
    :aria-label="title"
  >
    <p v-if="title" class="content-read-more-title">{{ title }}</p>
    <div class="content-read-more-list">
      <component
        :is="componentFor(item.to)"
        v-for="item in items"
        :key="item.to"
        v-bind="linkProps(item)"
        class="content-read-more-link"
      >
        <span v-if="item.icon" class="content-read-more-icon" aria-hidden="true">
          <Icon :name="resolveIconifyIcon(item.icon) ?? item.icon" />
        </span>
        <span class="content-read-more-copy">
          <span class="content-read-more-label">{{ item.title }}</span>
          <span v-if="item.description" class="content-read-more-description">
            {{ item.description }}
          </span>
        </span>
        <Icon name="lucide:arrow-up-right" class="content-read-more-arrow" aria-hidden="true" />
      </component>
    </div>
  </nav>
</template>
