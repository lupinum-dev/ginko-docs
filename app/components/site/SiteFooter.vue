<script setup lang="ts">
import { hasConfigurableOptionalServices } from "@/config/service-registry";
import { computed } from "vue";
import { useI18n } from "#imports";
import { useLocalizedPath } from "@/composables/useLocalizedPath";
import { useSiteNavigation } from "@/composables/useSiteNavigation";
import { useCookieConsentUi } from "@/components/site/cookie/useCookieConsentUi";
import { useTracking } from "@/composables/useTracking";
import { useDocsEntryPath } from "@/features/docs/composables/useDocsEntryPath";
import SiteLogoMark from "@/components/site/SiteLogoMark.vue";

const { site, footerNav, contact } = useSiteNavigation();
const { t } = useI18n();
const localizedPath = useLocalizedPath();
const docsEntryPath = await useDocsEntryPath();
const { trackContactLink, trackNavigation, trackOutboundLink } = useTracking();

const currentYearDate = new Date();
const { openCookieSettings } = useCookieConsentUi();
const canManageConsent = computed(() => hasConfigurableOptionalServices());
const footerNavigation = computed(() => ({
  ...footerNav.value,
  resources: [
    { label: t("nav.documentation"), href: docsEntryPath.value },
    ...footerNav.value.resources,
  ],
}));

function trackFooterNavigation(label: string, href: string, external = false) {
  if (external) {
    trackOutboundLink("footer", href, label);
    return;
  }
  trackNavigation("footer", label, href);
}
</script>

<template>
  <footer class="border-t border-border bg-muted/30" :aria-label="t('nav.company')">
    <div class="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
      <div class="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
        <div class="col-span-2 md:col-span-1">
          <NuxtLink
            :to="localizedPath('home')"
            class="flex items-center gap-2 font-semibold text-foreground"
          >
            <SiteLogoMark />
            <span>{{ site.name }}</span>
          </NuxtLink>
          <p class="mt-3 max-w-52 text-sm leading-relaxed text-muted-foreground">
            {{ site.description }}
          </p>
          <address class="mt-4 space-y-1 text-sm text-muted-foreground not-italic">
            <p>{{ contact.address.street }}</p>
            <p>{{ contact.address.postalCode }} {{ contact.address.city }}</p>
            <p>
              <a
                class="transition-colors hover:text-foreground"
                :href="`mailto:${contact.email}`"
                @click="trackContactLink('footer_email', `mailto:${contact.email}`)"
              >
                {{ contact.email }}
              </a>
            </p>
            <p v-if="contact.phone">
              <a
                class="transition-colors hover:text-foreground"
                :href="`tel:${contact.phone.replace(/\\s+/g, '')}`"
                @click="
                  trackContactLink('footer_phone', `tel:${contact.phone.replace(/\\s+/g, '')}`)
                "
              >
                {{ contact.phone }}
              </a>
            </p>
          </address>
        </div>
        <div>
          <h3 class="mb-3 text-sm font-semibold text-foreground">{{ t("nav.product") }}</h3>
          <ul class="space-y-2.5">
            <li v-for="item in footerNavigation.product" :key="item.href">
              <NuxtLink
                :to="item.href"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                @click="trackFooterNavigation(item.label, item.href)"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="mb-3 text-sm font-semibold text-foreground">{{ t("nav.resources") }}</h3>
          <ul class="space-y-2.5">
            <li v-for="item in footerNavigation.resources" :key="item.href">
              <NuxtLink
                :to="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                @click="trackFooterNavigation(item.label, item.href, item.external)"
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
        <div>
          <h3 class="mb-3 text-sm font-semibold text-foreground">{{ t("nav.company") }}</h3>
          <ul class="space-y-2.5">
            <li v-for="item in footerNavigation.company" :key="item.href">
              <NuxtLink
                :to="item.href"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                @click="trackFooterNavigation(item.label, item.href)"
              >
                {{ item.label }}
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
        <div
          v-if="canManageConsent"
          class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end"
        >
          <button
            type="button"
            class="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            @click="openCookieSettings"
          >
            {{ t("cookie.settingsLink") }}
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
