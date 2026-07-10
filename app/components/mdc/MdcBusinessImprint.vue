<script setup lang="ts">
import { siteConfig } from "@/site.config";
import { formatSiteAddress } from "@/config/site.utils";
import { computed } from "vue";
import { useI18n } from "#imports";

const { locale } = useI18n();
const addressLines = formatSiteAddress(siteConfig);
const hasManagingDirectors = computed(() => siteConfig.identity.managingDirectors.length > 0);
const hasRegisterData = computed(
  () =>
    Boolean(siteConfig.identity.registry) ||
    Boolean(siteConfig.identity.registryCourt) ||
    Boolean(siteConfig.identity.vatId),
);
const labels = computed(() =>
  locale.value === "de"
    ? {
        provider: "Anbieter",
        contact: "Kontakt",
        email: "E-Mail",
        phone: "Telefon",
        representedBy: "Vertreten durch",
        register: "Register und UID",
        registry: "Firmenbuchnummer",
        registryCourt: "Firmenbuchgericht",
        vat: "UID",
        responsible: "Inhaltlich verantwortlich",
      }
    : {
        provider: "Provider",
        contact: "Contact",
        email: "Email",
        phone: "Phone",
        representedBy: "Represented by",
        register: "Registry and VAT",
        registry: "Company register number",
        registryCourt: "Register court",
        vat: "VAT ID",
        responsible: "Responsible for content",
      },
);
</script>

<template>
  <div class="not-prose space-y-6 rounded-lg border border-border bg-muted/30 p-4 text-sm">
    <section>
      <h2 class="mb-3 text-lg font-semibold text-foreground">{{ labels.provider }}</h2>
      <address class="space-y-1 text-muted-foreground not-italic">
        <p>
          <strong class="font-medium text-foreground">{{ siteConfig.identity.legalName }}</strong>
        </p>
        <p v-for="line in addressLines" :key="line">{{ line }}</p>
      </address>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold text-foreground">{{ labels.contact }}</h2>
      <div class="space-y-1 text-muted-foreground">
        <p>
          {{ labels.email }}:
          <a class="text-primary hover:underline" :href="`mailto:${siteConfig.contact.email}`">
            {{ siteConfig.contact.email }}
          </a>
        </p>
        <p v-if="siteConfig.contact.phone">
          {{ labels.phone }}:
          <a
            class="text-primary hover:underline"
            :href="`tel:${siteConfig.contact.phone.replace(/\\s+/g, '')}`"
          >
            {{ siteConfig.contact.phone }}
          </a>
        </p>
      </div>
    </section>

    <section v-if="hasManagingDirectors">
      <h2 class="mb-3 text-lg font-semibold text-foreground">{{ labels.representedBy }}</h2>
      <p class="text-muted-foreground">
        {{ siteConfig.identity.managingDirectors.join(", ") }}
      </p>
    </section>

    <section v-if="hasRegisterData">
      <h2 class="mb-3 text-lg font-semibold text-foreground">{{ labels.register }}</h2>
      <dl class="space-y-1 text-muted-foreground">
        <div v-if="siteConfig.identity.registry">
          <dt class="inline font-medium text-foreground">{{ labels.registry }}:</dt>
          <dd class="inline">{{ siteConfig.identity.registry }}</dd>
        </div>
        <div v-if="siteConfig.identity.registryCourt">
          <dt class="inline font-medium text-foreground">{{ labels.registryCourt }}:</dt>
          <dd class="inline">{{ siteConfig.identity.registryCourt }}</dd>
        </div>
        <div v-if="siteConfig.identity.vatId">
          <dt class="inline font-medium text-foreground">{{ labels.vat }}:</dt>
          <dd class="inline">{{ siteConfig.identity.vatId }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="siteConfig.legal.responsibleForContent">
      <h2 class="mb-3 text-lg font-semibold text-foreground">{{ labels.responsible }}</h2>
      <p class="text-muted-foreground">{{ siteConfig.legal.responsibleForContent }}</p>
    </section>
  </div>
</template>
