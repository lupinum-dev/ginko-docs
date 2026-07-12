<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";
import { useLocalizedPath } from "#ginko-docs/composables/useLocalizedPath";
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";
import { useDocsEntryPath } from "#ginko-docs/features/docs/composables/useDocsEntryPath";

const { site, footerNav } = useSiteNavigation();
const { t } = useI18n();
const localizedPath = useLocalizedPath();
const docsEntryPath = await useDocsEntryPath();

const currentYearDate = new Date();
const resources = computed(() => [
  { label: t("nav.documentation"), href: docsEntryPath.value, external: false },
  ...footerNav.value.resources,
]);
</script>

<template>
  <footer class="border-t border-border bg-muted/30" :aria-label="t('nav.company')">
    <div class="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div class="max-w-sm">
          <NuxtLink
            :to="localizedPath('home')"
            class="flex items-center gap-2 font-semibold text-foreground"
          >
            <SiteLogoMark />
            <span>{{ site.name }}</span>
          </NuxtLink>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            {{ site.description }}
          </p>
        </div>
        <div>
          <h3 class="mb-3 text-sm font-semibold text-foreground">{{ t("nav.resources") }}</h3>
          <ul class="space-y-2.5">
            <li v-for="item in resources" :key="item.href">
              <NuxtLink
                :to="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {{ item.label }}
                <Icon
                  v-if="item.external"
                  name="lucide:arrow-up-right"
                  class="size-3 opacity-60"
                  aria-hidden="true"
                />
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row"
      >
        <p>
          © <NuxtTime :datetime="currentYearDate" year="numeric" /> {{ site.name }}.
          {{ t("site.footer") }}
        </p>
      </div>
    </div>
  </footer>
</template>
