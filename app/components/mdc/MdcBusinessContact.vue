<script setup lang="ts">
import { siteConfig } from "@/site.config";
import { formatSiteAddress } from "@/config/site.utils";

const addressLines = formatSiteAddress(siteConfig);
</script>

<template>
  <address class="space-y-1 rounded-lg border border-border bg-muted/30 p-4 text-sm not-italic">
    <p>
      <strong class="font-medium text-foreground">{{ siteConfig.identity.legalName }}</strong>
    </p>
    <p v-for="line in addressLines" :key="line">{{ line }}</p>
    <p>
      <a :href="`mailto:${siteConfig.contact.email}`">{{ siteConfig.contact.email }}</a>
    </p>
    <p v-if="siteConfig.contact.phone">
      <a :href="`tel:${siteConfig.contact.phone.replace(/\\s+/g, '')}`">
        {{ siteConfig.contact.phone }}
      </a>
    </p>
  </address>
</template>
