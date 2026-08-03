<script setup lang="ts">
import { Button } from "#ginko-docs/components/ui/button";
import { useSiteNavigation } from "#ginko-docs/composables/useSiteNavigation";

const { socialLinks } = useSiteNavigation();

defineEmits<{ navigate: [] }>();
</script>

<template>
  <div v-if="socialLinks.length" class="flex items-center">
    <Button
      v-for="link in socialLinks"
      :key="link.href"
      as-child
      variant="ghost"
      size="icon"
      class="text-muted-foreground hover:text-foreground"
    >
      <NuxtLink
        :to="link.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="link.label"
        @click="$emit('navigate')"
      >
        <Icon :name="link.icon ?? 'lucide:link'" class="size-[18px]" aria-hidden="true" />
      </NuxtLink>
    </Button>
  </div>
</template>
