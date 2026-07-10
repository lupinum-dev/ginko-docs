<script setup lang="ts">
import { siteConfig } from "@/site.config";
import { formatSiteAddress } from "@/config/site.utils";
import ContactForm from "@/features/contact/components/ContactForm.vue";
import { computed } from "vue";
import { definePageMeta, useI18n, useSeoMeta } from "#imports";
import { useTracking } from "@/composables/useTracking";

definePageMeta({ layout: "marketing" });

const { locale, t } = useI18n();
const addressLines = formatSiteAddress(siteConfig);
const { trackContactLink } = useTracking();
const contactFormAnchorId = computed(() => (locale.value === "de" ? "kontakt" : "contact"));

useSeoMeta({
  title: computed(() => t("pages.contact.title")),
  description: computed(() => t("pages.contact.description")),
  ogTitle: computed(() => t("pages.contact.title")),
  ogDescription: computed(() => t("pages.contact.description")),
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
    <div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <section>
        <p class="text-sm font-semibold text-primary">{{ t("pages.contact.eyebrow") }}</p>
        <h1
          class="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          {{ t("pages.contact.headline") }}
        </h1>
        <p class="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          {{ t("pages.contact.subline") }}
        </p>

        <div class="mt-10 space-y-6 text-sm">
          <div>
            <p class="font-medium text-foreground">{{ t("pages.contact.email") }}</p>
            <a
              class="mt-1 inline-flex text-primary underline-offset-4 hover:underline"
              :href="`mailto:${siteConfig.contact.email}`"
              @click="trackContactLink('contact_page_email', `mailto:${siteConfig.contact.email}`)"
            >
              {{ siteConfig.contact.email }}
            </a>
          </div>
          <div v-if="siteConfig.contact.phone">
            <p class="font-medium text-foreground">{{ t("pages.contact.phone") }}</p>
            <a
              class="mt-1 inline-flex text-primary underline-offset-4 hover:underline"
              :href="`tel:${siteConfig.contact.phone.replace(/\\s+/g, '')}`"
              @click="
                trackContactLink(
                  'contact_page_phone',
                  `tel:${siteConfig.contact.phone.replace(/\\s+/g, '')}`,
                )
              "
            >
              {{ siteConfig.contact.phone }}
            </a>
          </div>
          <div>
            <p class="font-medium text-foreground">{{ t("pages.contact.address") }}</p>
            <address class="mt-1 leading-6 text-muted-foreground not-italic">
              <span v-for="line in addressLines" :key="line" class="block">{{ line }}</span>
            </address>
          </div>
        </div>
      </section>

      <section
        :id="contactFormAnchorId"
        class="rounded-lg border border-border bg-card p-5 shadow-xs scroll-mt-24 sm:p-8"
      >
        <h2 class="text-xl font-semibold text-foreground">{{ t("pages.contact.formTitle") }}</h2>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">
          {{ t("pages.contact.formDescription") }}
        </p>
        <div class="mt-6">
          <ContactForm />
        </div>
      </section>
    </div>
  </div>
</template>
