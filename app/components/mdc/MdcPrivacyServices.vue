<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "#imports";
import {
  getLocalizedServiceText,
  getPrivacyServiceInventory,
  requiresConsentBanner,
} from "@/config/service-registry";

const { locale } = useI18n();

const services = computed(() => getPrivacyServiceInventory());
const needsConsent = computed(() => requiresConsentBanner());
const text = computed(() =>
  locale.value === "de"
    ? {
        title: "Konfigurierte Dienste",
        noOptional:
          "In der aktuellen Basiskonfiguration sind keine zustimmungspflichtigen optionalen Dienste aktiviert. Deshalb ist kein Cookie-Banner nur für Tracking erforderlich.",
        consentRequired: "zustimmungspflichtig",
        consentNotRequired: "keine Zustimmung erforderlich",
        category: "Kategorie",
        status: "Status",
      }
    : {
        title: "Configured services",
        noOptional:
          "The base configuration does not enable consent-relevant optional services. In that setup, no cookie banner is needed just for tracking.",
        consentRequired: "requires consent",
        consentNotRequired: "no consent required",
        category: "category",
        status: "status",
      },
);
</script>

<template>
  <div class="not-prose space-y-4 rounded-lg border border-border bg-muted/30 p-4 text-sm">
    <h2 class="text-lg font-semibold text-foreground">{{ text.title }}</h2>

    <p v-if="!needsConsent" class="text-muted-foreground">{{ text.noOptional }}</p>

    <ul class="space-y-3">
      <li
        v-for="service in services"
        :key="service.id"
        class="rounded-md border border-border bg-background p-3"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="font-medium text-foreground">
              {{ getLocalizedServiceText(service.label, locale) }}
            </h3>
            <p class="mt-1 text-muted-foreground">
              {{ getLocalizedServiceText(service.description, locale) }}
            </p>
          </div>
          <span class="shrink-0 text-xs font-medium text-muted-foreground uppercase">
            {{ service.provider }}
          </span>
        </div>
        <dl class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div class="flex gap-1">
            <dt>{{ text.category }}:</dt>
            <dd>{{ service.category }}</dd>
          </div>
          <div class="flex gap-1">
            <dt>{{ text.status }}:</dt>
            <dd>{{ service.status }}</dd>
          </div>
          <div>
            {{ service.requiresConsent ? text.consentRequired : text.consentNotRequired }}
          </div>
        </dl>
      </li>
    </ul>
  </div>
</template>
