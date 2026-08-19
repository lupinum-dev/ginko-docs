<script setup lang="ts">
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";
import { headerUtilityButtonClass } from "#ginko-docs/components/site/header-utils";

const { socialLinks } = useSiteNavigation();

defineEmits<{ navigate: [] }>();
</script>

<template>
  <div v-if="socialLinks.length" class="flex items-center">
    <NuxtLink
      v-for="link in socialLinks"
      :key="link.href"
      :to="link.href"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="link.label"
      :class="headerUtilityButtonClass"
      @click="$emit('navigate')"
    >
      <Icon :name="link.icon ?? 'lucide:link'" class="size-[18px]" aria-hidden="true" />
    </NuxtLink>
  </div>
</template>
